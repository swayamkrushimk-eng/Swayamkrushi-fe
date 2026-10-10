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
  imageAlt = '',
  hasVideo = false,
  storyImages = []
}) {
  const renderedElements = useMemo(() => {
    if (!htmlContent) return null

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // 1. Check for intentional in-place <figure> elements
      const figureElements = Array.from(doc.body.querySelectorAll('figure'))
      const hasExplicitFigures = figureElements.length > 0

      // Sync captions for intentional in-place <figure> elements from storyImages
      if (hasExplicitFigures && Array.isArray(storyImages) && storyImages.length > 0) {
        figureElements.forEach((fig) => {
          const imgEl = fig.querySelector('img')
          const src = imgEl?.getAttribute('src')?.trim()
          if (!src) return
          const matched = storyImages.find((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
          if (matched && matched.caption) {
            let figcaption = fig.querySelector('figcaption')
            if (!figcaption) {
              figcaption = doc.createElement('figcaption')
              figcaption.className = 'article-inline-caption'
              fig.appendChild(figcaption)
            }
            figcaption.textContent = matched.caption
            imgEl.setAttribute('alt', matched.caption)
          }
        })
      }

      const figureSources = figureElements
        .map((fig) => fig.querySelector('img')?.getAttribute('src')?.trim())
        .filter(Boolean)

      // Gather remaining images that need paragraph distribution
      const extractedImages = []

      if (!hasExplicitFigures) {
        // Legacy: Extract from <figure> if not marked for in-place
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
      }

      // Extract from remaining <img> tags (including those nested inside <p>)
      const imgElements = Array.from(doc.body.querySelectorAll('img'))
      imgElements.forEach((img) => {
        // Do not touch images inside preserved <figure> elements
        if (hasExplicitFigures && img.closest('figure')) return

        const src = img.getAttribute('src')?.trim()
        if (
          src &&
          !figureSources.some((fSrc) => isSameImage(fSrc, src)) &&
          !extractedImages.some((x) => isSameImage(x.src, src))
        ) {
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

      // 2. Check cover / featured image (only for legacy articles without curated in-place figures)
      const coverUrl =
        !hasExplicitFigures &&
        inlineMedia &&
        !inlineMedia.isVideo &&
        inlineMedia.posterUrl
          ? inlineMedia.posterUrl.trim()
          : null

      const isCoverPlaceholder = coverUrl
        ? coverUrl.toLowerCase().includes('.svg') ||
          coverUrl.toLowerCase().includes('/mocks/') ||
          coverUrl.toLowerCase().includes('raw/upload') ||
          coverUrl.toLowerCase().includes('placeholder')
        : false

      const isCoverAlreadyExtracted = coverUrl
        ? extractedImages.some((img) => isSameImage(img.src, coverUrl)) ||
          figureSources.some((src) => isSameImage(src, coverUrl))
        : false

      const allImages = []
      if (
        coverUrl &&
        !isCoverAlreadyExtracted &&
        !isCoverPlaceholder &&
        extractedImages.length === 0
      ) {
        allImages.push({
          src: coverUrl,
          caption:
            imageAlt || (articleTitle ? `Archival spotlight: ${articleTitle}` : ''),
          alt: imageAlt || articleTitle || ''
        })
      }
      allImages.push(...extractedImages)

      // Fallback if no images found at all (only for legacy articles without explicit figures)
      if (!hasExplicitFigures && allImages.length === 0 && localFallback && !localFallback.toLowerCase().includes('.svg')) {
        allImages.push({
          src: localFallback,
          caption: imageAlt || '',
          alt: imageAlt || articleTitle || ''
        })
      }

      // Sync extracted images with storyImages captions AND include any story photos not directly in HTML
      if (Array.isArray(storyImages) && storyImages.length > 0) {
        storyImages.forEach((si) => {
          const siUrl = typeof si === 'string' ? si : si.url
          if (!siUrl) return
          const siCap = typeof si === 'object' ? (si.caption || si.alt || '') : ''
          const siAlt = typeof si === 'object' ? (si.alt || si.caption || '') : ''

          const existing = allImages.find((img) => isSameImage(img.src, siUrl))
          if (existing) {
            if (siCap) existing.caption = siCap
            if (siAlt) existing.alt = siAlt
          } else if (!figureSources.some((src) => isSameImage(src, siUrl))) {
            allImages.push({
              src: siUrl,
              caption: siCap,
              alt: siAlt || siCap || articleTitle
            })
          }
        })
      }

      // If an explicit imageAlt is passed, apply it to the first image if it has no custom caption
      if (imageAlt && allImages.length > 0) {
        if (!allImages[0].caption || allImages[0].caption.trim() === '' || allImages[0].caption === articleTitle) {
          allImages[0].caption = imageAlt
        }
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

      // 4. Deterministic editorial layout & image pacing
      // Rule 1: Never place an image directly below the video (at least 1-2 paragraphs of text separation).
      // Rule 2: Never cluster images too close to each other (minimum 3 paragraphs apart, evenly distributed).
      const seed = getArticleHash((articleId || '') + ':' + (articleTitle || ''))
      const startsRight = seed % 2 === 0
      const totalParas = pNodeIndices.length

      const hasEmbeddedVideo = hasVideo || Boolean(doc.body.querySelector('video, iframe'))

      // Determine initial paragraph index:
      // When video is present, the first image NEVER starts at para 0 (starts at para 1 or 2).
      // For text articles, starts at para 1 so the lede paragraph is clean broadsheet lead text.
      const initialPara = hasEmbeddedVideo
        ? (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : 1 + (seed % 2))
        : (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : 1)

      const remainingParas = Math.max(0, totalParas - 1 - initialPara)
      const remainingImages = Math.max(1, allImages.length - 1)
      const dynamicStep = Math.max(3, Math.min(6, Math.floor(remainingParas / remainingImages)))

      // Map node index -> array of image objects to insert BEFORE that node
      const insertBeforeMap = new Map()
      let prevParaTarget = 0

      allImages.forEach((imgObj, imgIdx) => {
        let targetPara = 0
        if (imgIdx === 0) {
          targetPara = Math.min(totalParas - 1, initialPara)
        } else {
          // Space subsequent images apart by at least 3 paragraphs, with dynamic pacing
          const stepVariance = (seed >> (imgIdx + 1)) % 2
          const spacing = Math.max(3, dynamicStep + stepVariance)
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
                if (localFallback && e.target.src !== localFallback && !localFallback.toLowerCase().includes('.svg')) {
                  e.target.src = localFallback
                } else {
                  const fig = e.target.closest('figure')
                  if (fig) fig.style.display = 'none'
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

        // In-place Figure Element
        if (tagName === 'figure') {
          const img = node.querySelector('img')
          const figcaption = node.querySelector('figcaption')
          const src = img?.getAttribute('src')?.trim()
          if (!src) return null
          let caption =
            figcaption?.textContent?.trim() ||
            img?.getAttribute('alt') ||
            img?.getAttribute('title') ||
            ''
          if (Array.isArray(storyImages) && storyImages.length > 0) {
            const matched = storyImages.find((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
            if (matched && matched.caption) {
              caption = matched.caption
            }
          }
          const alt = img?.getAttribute('alt') || caption || articleTitle
          const alignClass = node.classList.contains('float-right')
            ? 'float-right'
            : node.classList.contains('float-left')
            ? 'float-left'
            : 'float-right'

          return renderFigure({ src, caption, alt, alignClass }, key)
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
  }, [htmlContent, articleTitle, articleId, inlineMedia, localFallback, imageAlt, hasVideo, storyImages])

  return <div className="article-rich-content">{renderedElements}</div>
}
