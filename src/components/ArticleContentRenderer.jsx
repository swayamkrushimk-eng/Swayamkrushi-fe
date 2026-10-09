import React, { useMemo } from 'react'
import VideoPlayer from './VideoPlayer'

/**
 * Deterministic hash function to generate consistent, pseudo-random layout variations
 * across different articles so layouts don't look repetitive/uniform.
 */
function getArticleHash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Checks if two image URLs point to the same file (supports Cloudinary public IDs)
 */
function isSameImage(url1, url2) {
  if (!url1 || !url2) return false
  const u1 = url1.trim().toLowerCase()
  const u2 = url2.trim().toLowerCase()
  if (u1 === u2) return true
  const matchA = u1.match(/\/v\d+\/([^.?#]+)/)
  const matchB = u2.match(/\/v\d+\/([^.?#]+)/)
  if (matchA && matchB && matchA[1] === matchB[1]) return true
  return false
}

export default function ArticleContentRenderer({
  htmlContent,
  articleTitle = '',
  articleId = '',
  inlineMedia = null,
  localFallback = null,
  imageAlt = ''
}) {
  const renderedElements = useMemo(() => {
    if (!htmlContent) return null

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // 1. Gather all existing images from the HTML and decouple them from fixed positions
      const extractedImages = []

      // Extract from <figure>
      const figureElements = Array.from(doc.body.querySelectorAll('figure'))
      figureElements.forEach((fig) => {
        const img = fig.querySelector('img')
        const figcaption = fig.querySelector('figcaption')
        if (img) {
          const src = img.getAttribute('src')?.trim()
          if (src && !extractedImages.some((x) => isSameImage(x.src, src))) {
            const caption =
              figcaption?.textContent?.trim() ||
              img.getAttribute('alt') ||
              img.getAttribute('title') ||
              ''
            extractedImages.push({
              src,
              caption,
              alt: img.getAttribute('alt') || caption
            })
          }
        }
        fig.remove()
      })

      // Extract from remaining <img> tags (including those nested inside <p>)
      const imgElements = Array.from(doc.body.querySelectorAll('img'))
      imgElements.forEach((img) => {
        const src = img.getAttribute('src')?.trim()
        if (src && !extractedImages.some((x) => isSameImage(x.src, src))) {
          const alt = img.getAttribute('alt') || img.getAttribute('title') || ''
          extractedImages.push({
            src,
            caption: alt,
            alt
          })
        }
        const parent = img.parentNode
        img.remove()

        // Clean up punctuation / artifacts if removing the img left orphan leading dots, e.g. ".Manjulaa"
        if (parent && parent.tagName && parent.tagName.toLowerCase() === 'p') {
          const cleanedHtml = parent.innerHTML
            .replace(/^(\s*(&nbsp;)?\s*)*\.\s*(?=[A-Za-z0-9])/gi, '')
            .trim()
          parent.innerHTML = cleanedHtml
        }
      })

      // Remove any containers that became empty after extracting images
      const allElements = Array.from(doc.body.querySelectorAll('*'))
      allElements.forEach((el) => {
        const tag = el.tagName?.toLowerCase()
        if (tag === 'p' || tag === 'div' || tag === 'span') {
          const text = el.textContent?.trim() || ''
          const hasMedia = el.querySelector('video, iframe, audio')
          if (!text && !hasMedia && el.children.length === 0) {
            el.remove()
          }
        }
      })

      // 2. Check cover / featured image
      const coverUrl =
        inlineMedia && !inlineMedia.isVideo && inlineMedia.posterUrl
          ? inlineMedia.posterUrl.trim()
          : null

      const isCoverPlaceholder = coverUrl
        ? coverUrl.endsWith('.svg') ||
          coverUrl.includes('/mocks/') ||
          coverUrl.includes('raw/upload')
        : false

      const isCoverAlreadyExtracted = coverUrl
        ? extractedImages.some((img) => isSameImage(img.src, coverUrl))
        : false

      const allImages = []
      if (
        coverUrl &&
        !isCoverAlreadyExtracted &&
        (!isCoverPlaceholder || extractedImages.length === 0)
      ) {
        allImages.push({
          src: coverUrl,
          caption:
            imageAlt || (articleTitle ? `Archival spotlight: ${articleTitle}` : ''),
          alt: imageAlt || articleTitle || ''
        })
      }
      allImages.push(...extractedImages)

      // Fallback if no images found at all
      if (allImages.length === 0 && localFallback) {
        allImages.push({
          src: localFallback,
          caption: imageAlt || '',
          alt: imageAlt || articleTitle || ''
        })
      }

      // 3. Find content body nodes and paragraph indices
      const cleanBodyNodes = Array.from(doc.body.childNodes).filter((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return Boolean(node.textContent && node.textContent.trim())
        }
        return node.nodeType === Node.ELEMENT_NODE
      })

      const pNodeIndices = []
      cleanBodyNodes.forEach((node, idx) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName?.toLowerCase()
          if (tag === 'p') {
            pNodeIndices.push(idx)
          }
        }
      })

      // 4. Deterministic hash-based randomizer for varied, editorial placements
      // Alternates sides (left vs right) and varies paragraph position per article
      const seed = getArticleHash((articleId || '') + ':' + (articleTitle || ''))
      const startsRight = seed % 2 === 0
      const totalParas = pNodeIndices.length

      // Map node index -> array of image objects to insert BEFORE that node
      const insertBeforeMap = new Map()
      let prevParaTarget = 0

      allImages.forEach((imgObj, imgIdx) => {
        let targetPara = 0
        if (imgIdx === 0) {
          if (totalParas <= 1) {
            targetPara = 0
          } else if (totalParas === 2) {
            targetPara = seed % 2 // 0 or 1
          } else {
            targetPara = seed % 3 // 0, 1, or 2 (top, 2nd, or 3rd para)
          }
        } else {
          // Space subsequent images apart by 2 or 3 paragraphs so they never clash
          const spacing = 2 + ((seed >> (imgIdx + 1)) % 2)
          targetPara = Math.min(totalParas - 1, prevParaTarget + spacing)
        }
        prevParaTarget = targetPara

        const isRight = imgIdx % 2 === 0 ? startsRight : !startsRight
        const alignClass = isRight ? 'float-right' : 'float-left'

        const targetNodeIdx =
          pNodeIndices.length > 0
            ? pNodeIndices[targetPara]
            : Math.min(cleanBodyNodes.length - 1, imgIdx)

        if (!insertBeforeMap.has(targetNodeIdx)) {
          insertBeforeMap.set(targetNodeIdx, [])
        }
        insertBeforeMap.get(targetNodeIdx).push({
          ...imgObj,
          alignClass,
          key: `article-img-${imgIdx}`
        })
      })

      const renderFigure = (imgObj, key) => {
        if (!imgObj?.src) return null
        return (
          <figure key={key} className={`article-inline-figure ${imgObj.alignClass}`}>
            <img
              src={imgObj.src}
              alt={imgObj.caption || imgObj.alt || articleTitle}
              className="article-inline-img"
              onError={(e) => {
                if (localFallback && e.target.src !== localFallback) {
                  e.target.src = localFallback
                }
              }}
            />
            {imgObj.caption ? (
              <figcaption className="article-inline-caption">
                {imgObj.caption}
              </figcaption>
            ) : null}
          </figure>
        )
      }

      const renderNode = (node, key) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim()
          if (!text) return null
          return (
            <p key={key} className="article-editorial-paragraph">
              {text}
            </p>
          )
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return null

        const tagName = node.tagName.toLowerCase()

        // Hide duplicate H2 title if it repeats the article headline
        if (
          tagName === 'h2' &&
          articleTitle &&
          node.textContent.trim().toLowerCase() === articleTitle.trim().toLowerCase()
        ) {
          return null
        }

        // Direct Video Element
        if (tagName === 'video') {
          const src =
            node.getAttribute('src') || node.querySelector('source')?.getAttribute('src')
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

        // Node containing video child(ren)
        const videoEls = node.querySelectorAll('video')
        if (videoEls.length > 0) {
          const vid = videoEls[0]
          const src =
            vid.getAttribute('src') || vid.querySelector('source')?.getAttribute('src')
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

        // Standard Paragraph Element
        if (tagName === 'p') {
          return (
            <p
              key={key}
              className="article-editorial-paragraph article-rich-p"
              dangerouslySetInnerHTML={{ __html: node.innerHTML }}
            />
          )
        }

        // Standard regular HTML elements (h1, h2, h3, blockquote, ul, ol, etc.)
        return (
          <div
            key={key}
            className={`article-rich-chunk article-rich-${tagName}`}
            dangerouslySetInnerHTML={{ __html: node.outerHTML }}
          />
        )
      }

      const results = []
      const insertedKeys = new Set()

      cleanBodyNodes.forEach((node, idx) => {
        // Insert any figure scheduled BEFORE this node
        if (insertBeforeMap.has(idx)) {
          const imgs = insertBeforeMap.get(idx)
          imgs.forEach((img) => {
            const fig = renderFigure(img, img.key)
            if (fig) {
              results.push(fig)
              insertedKeys.add(img.key)
            }
          })
        }

        // Render the content node itself
        const rendered = renderNode(node, `art-node-${idx}`)
        if (rendered) results.push(rendered)
      })

      // Fallback: if any image wasn't inserted (e.g. empty content or past end)
      allImages.forEach((imgObj, imgIdx) => {
        const key = `article-img-${imgIdx}`
        if (!insertedKeys.has(key)) {
          const isRight = imgIdx % 2 === 0 ? startsRight : !startsRight
          const alignClass = isRight ? 'float-right' : 'float-left'
          const fig = renderFigure({ ...imgObj, alignClass }, key)
          if (fig) results.push(fig)
        }
      })

      return results
    } catch (err) {
      console.warn('Error rendering rich article content:', err)
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    }
  }, [htmlContent, articleTitle, articleId, inlineMedia, localFallback, imageAlt])

  return <div className="article-rich-content">{renderedElements}</div>
}
