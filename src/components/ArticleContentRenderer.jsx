import React, { useMemo } from 'react'
import VideoPlayer from './VideoPlayer'

export default function ArticleContentRenderer({ htmlContent, articleTitle }) {
  const renderedElements = useMemo(() => {
    if (!htmlContent) return null

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')
      const bodyNodes = Array.from(doc.body.childNodes)

      const renderNode = (node, key) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent
          if (!text || !text.trim()) return null
          return <span key={key}>{text}</span>
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return null

        const tagName = node.tagName.toLowerCase()

        // 1. Direct Video Element
        if (tagName === 'video') {
          const src = node.getAttribute('src') || node.querySelector('source')?.getAttribute('src')
          const poster = node.getAttribute('poster') || undefined
          if (src) {
            return (
              <div key={key} className="article-embedded-video-card">
                <VideoPlayer
                  src={src}
                  poster={poster}
                  autoPlay={false}
                  title={articleTitle}
                  category="Story Clip"
                />
              </div>
            )
          }
        }

        // 2. Node containing video child(ren) (e.g., <p><video .../></p>)
        const videoEls = node.querySelectorAll('video')
        if (videoEls.length > 0) {
          // If it only contains the video
          if (
            node.children.length === 1 &&
            node.children[0].tagName.toLowerCase() === 'video' &&
            !node.textContent.trim()
          ) {
            const vid = node.children[0]
            const src = vid.getAttribute('src') || vid.querySelector('source')?.getAttribute('src')
            const poster = vid.getAttribute('poster') || undefined
            if (src) {
              return (
                <div key={key} className="article-embedded-video-card">
                  <VideoPlayer
                    src={src}
                    poster={poster}
                    autoPlay={false}
                    title={articleTitle}
                    category="Story Clip"
                  />
                </div>
              )
            }
          }

          // Mixed content inside node
          const childNodes = Array.from(node.childNodes)
          return (
            <div key={key} className={`article-rich-block article-rich-${tagName}`}>
              {childNodes.map((child, cIdx) => renderNode(child, `${key}-${cIdx}`))}
            </div>
          )
        }

        // 3. Standard regular HTML element
        return (
          <div
            key={key}
            className="article-rich-chunk"
            dangerouslySetInnerHTML={{ __html: node.outerHTML }}
          />
        )
      }

      return bodyNodes.map((node, idx) => renderNode(node, `art-node-${idx}`))
    } catch (err) {
      console.warn('Error rendering rich article content:', err)
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    }
  }, [htmlContent, articleTitle])

  return <div className="article-rich-content">{renderedElements}</div>
}
