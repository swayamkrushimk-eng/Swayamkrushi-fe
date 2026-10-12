import React, { useMemo } from 'react'
import VideoPlayer from './VideoPlayer'
import { isSameImage, isVideoUrl } from '../utils/mediaUtils'

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

const BED_HOTSPOT_VIDEOS = [
  {
    title: 'M Sarada (Principal)',
    caption: 'An overview...Principal Sarada speaks about the B.ED course'
  },
  {
    title: 'PVB Sudhakar (HoD)',
    caption: 'Direct from the Head....Sudhakar gives an intro'
  }
]

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

      const hasEmbeddedVideo = hasVideo || Boolean(inlineMedia?.isVideo) || Boolean(doc.body.querySelector('video, iframe'))

      // Filter helper for video thumbnails/posters
      const isVideoPosterOrThumb = (url) => {
        if (!hasEmbeddedVideo || !url) return false
        if (inlineMedia) {
          if (isSameImage(url, inlineMedia.posterUrl)) return true
          if (isSameImage(url, inlineMedia.videoThumbnailUrl)) return true
          if (isSameImage(url, inlineMedia.videoUrl)) return true
          if (isSameImage(url, inlineMedia.deliveryVideoUrl)) return true
        }
        return false
      }

      // 1. Check for intentional in-place <figure> elements
      const figureElements = Array.from(doc.body.querySelectorAll('figure'))
      
      // Remove any explicit figures that contain duplicate video thumbnails/posters
      if (hasEmbeddedVideo) {
        figureElements.forEach((fig) => {
          const img = fig.querySelector('img')
          const src = img?.getAttribute('src')?.trim()
          if (src && isVideoPosterOrThumb(src)) {
            fig.remove()
          }
        })
      }

      // Remove any orphan figcaptions that are not inside a figure (e.g. malformed closing tags)
      const allFigcaptions = Array.from(doc.body.querySelectorAll('figcaption'))
      allFigcaptions.forEach((fc) => {
        if (!fc.closest('figure')) {
          fc.remove()
        }
      })

      // Remove any empty figure tags without images or videos
      Array.from(doc.body.querySelectorAll('figure')).forEach((fig) => {
        if (!fig.querySelector('img') && !fig.querySelector('video')) fig.remove()
      })

      const cleanFigureElements = Array.from(doc.body.querySelectorAll('figure'))
      const hasExplicitFigures = cleanFigureElements.length > 0

      // Sync captions and classes for intentional in-place <figure> elements from storyImages
      if (hasExplicitFigures && Array.isArray(storyImages)) {
        cleanFigureElements.forEach((fig) => {
          const imgEl = fig.querySelector('img')
          const src = imgEl?.getAttribute('src')?.trim()
          if (!src) return

          // If storyImages array is defined, strictly purge any figure that was removed from storyImages!
          if (storyImages.length > 0) {
            const matched = storyImages.find((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
            if (!matched) {
              fig.remove()
              return
            }
            if (matched.caption) {
              let figcaption = fig.querySelector('figcaption')
              if (!figcaption) {
                figcaption = doc.createElement('figcaption')
                figcaption.className = 'article-inline-caption'
                fig.appendChild(figcaption)
              }
              figcaption.textContent = matched.caption
              imgEl.setAttribute('alt', matched.caption)
            } else {
              const figcaption = fig.querySelector('figcaption')
              if (figcaption) figcaption.remove()
            }

            const align = matched.placement === 'right' ? 'float-right' : matched.placement === 'center' ? 'float-center' : 'float-left'
            const sz = matched.size === 'big' ? 'size-big' : 'size-small'
            fig.className = `article-inline-figure ${align} ${sz}`
          }
        })
      }

      const figureSources = cleanFigureElements
        .map((fig) => fig.querySelector('img')?.getAttribute('src')?.trim())
        .filter(Boolean)

      // Gather remaining images that need paragraph distribution
      const extractedImages = []

      if (!hasExplicitFigures) {
        // Legacy: Extract from <figure> if not marked for in-place
        cleanFigureElements.forEach((fig) => {
          const img = fig.querySelector('img')
          const figcaption = fig.querySelector('figcaption')
          if (img) {
            const src = img.getAttribute('src')?.trim()
            if (src && !isVideoPosterOrThumb(src) && !extractedImages.some((x) => isSameImage(x.src, src))) {
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

        if (src && isVideoPosterOrThumb(src)) {
          // Remove duplicate video thumbnail from body
          const parent = img.parentNode
          img.remove()
          if (parent && parent.tagName && parent.tagName.toLowerCase() === 'p') {
            const cleanedHtml = parent.innerHTML
              .replace(/^(\s*(&nbsp;)?\s*)*\.\s*(?=[A-Za-z0-9])/gi, '')
              .trim()
            parent.innerHTML = cleanedHtml
          }
          return
        }

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

      // 2. Build image list for paragraph flow
      const coverUrl =
        !hasExplicitFigures &&
        !hasEmbeddedVideo &&
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

      if (extractedImages.length > 0) {
        // If images were uploaded inside the article HTML, use ONLY those images
        allImages.push(...extractedImages)

        // Sync custom captions/alt from storyImages without appending new/duplicate images
        if (Array.isArray(storyImages) && storyImages.length > 0) {
          storyImages.forEach((si) => {
            const siUrl = typeof si === 'string' ? si : si.url
            if (!siUrl) return
            const existing = allImages.find((img) => isSameImage(img.src, siUrl))
            if (existing) {
              if (typeof si === 'object' && si.caption !== undefined) {
                existing.caption = si.caption || ''
              }
              if (typeof si === 'object' && si.alt !== undefined) {
                existing.alt = si.alt || ''
              }
              if (typeof si === 'object' && si.placement) {
                existing.placement = si.placement
              }
            }
          })
        }
      } else if (!hasExplicitFigures && !hasEmbeddedVideo) {
        // Only if HTML has NO images and NO explicit figures, check storyImages / fallback
        if (Array.isArray(storyImages) && storyImages.length > 0) {
          storyImages.forEach((si) => {
            const siUrl = typeof si === 'string' ? si : si.url
            if (!siUrl || isVideoPosterOrThumb(siUrl)) return
            const siCap = typeof si === 'object' && si.caption !== undefined ? (si.caption || '') : (typeof si === 'object' ? (si.alt || '') : (imageAlt || ''))
            const siAlt = typeof si === 'object' && si.alt !== undefined ? (si.alt || '') : (siCap || articleTitle || '')

            if (!allImages.some((img) => isSameImage(img.src, siUrl))) {
              allImages.push({
                src: siUrl,
                caption: siCap,
                alt: siAlt
              })
            }
          })
        }

        // Fallback to coverUrl if no images in storyImages
        if (
          allImages.length === 0 &&
          !inlineMedia?.isText &&
          coverUrl &&
          !isCoverAlreadyExtracted &&
          !isCoverPlaceholder
        ) {
          allImages.push({
            src: coverUrl,
            caption:
              imageAlt || (articleTitle ? `Archival spotlight: ${articleTitle}` : ''),
            alt: imageAlt || articleTitle || ''
          })
        }

        // Fallback to local asset ONLY if no storyImages was explicitly specified (i.e. storyImages was not provided or null)
        const isExplicitlyNoStoryImages = Array.isArray(storyImages) && storyImages.length === 0
        if (
          allImages.length === 0 &&
          !inlineMedia?.isText &&
          !isExplicitlyNoStoryImages &&
          localFallback &&
          !localFallback.toLowerCase().includes('.svg') &&
          !localFallback.toLowerCase().includes('/mocks/')
        ) {
          allImages.push({
            src: localFallback,
            caption: imageAlt || '',
            alt: imageAlt || articleTitle || ''
          })
        }
      }

      // If an explicit imageAlt is passed, apply it to the first image if it has no custom caption (only for non-video articles)
      if (!hasEmbeddedVideo && imageAlt && allImages.length > 0) {
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
      const seed = getArticleHash((articleId || '') + ':' + (articleTitle || ''))
      const startsRight = seed % 2 === 0
      const totalParas = pNodeIndices.length

      // Determine initial paragraph index:
      // When video is present, the hero video is at the top. The first paragraph is below the video.
      // We start inline story photos around paragraph 1 or 2 so text flows naturally.
      // For text articles, starts at para 1 so the lede paragraph is clean broadsheet lead text.
      // For articles with a floated portrait hero video (e.g. story-dairy), the video spans paragraphs 0 and 1,
      // so inline images start at paragraph 2 to flow cleanly below the video on the left.
      const isDairy = articleId === 'story-dairy' || articleId === 'dairy'
      const initialPara = isDairy
        ? (totalParas >= 3 ? 2 : 1)
        : (hasEmbeddedVideo
            ? (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : (totalParas <= 4 ? 1 : 1 + (seed % 2)))
            : (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : 1))

      const remainingParas = Math.max(0, totalParas - 1 - initialPara)
      const remainingImages = Math.max(1, allImages.length - 1)
      const dynamicStep = Math.max(2, Math.min(5, Math.floor(remainingParas / remainingImages)))

      // Map node index -> array of image objects to insert BEFORE that node
      const insertBeforeMap = new Map()
      let prevParaTarget = 0

      const isBedHotspot = articleId === 'bed-hotspot' || articleId === 'bedhotspot'
      let embeddedVideoCount = 0

      allImages.forEach((imgObj, imgIdx) => {
        let targetPara = 0
        if (imgIdx === 0) {
          targetPara = Math.min(totalParas - 1, initialPara)
        } else {
          // Space subsequent images apart
          const stepVariance = (seed >> (imgIdx + 1)) % 2
          const spacing = Math.max(2, dynamicStep + stepVariance)
          targetPara = Math.min(totalParas - 1, prevParaTarget + spacing)
        }
        prevParaTarget = targetPara

        const isRight = isBedHotspot
          ? (imgIdx % 2 === 0)
          : (isDairy
              ? false
              : (imgObj.placement
                  ? imgObj.placement === 'right'
                  : (imgIdx % 2 === 0 ? startsRight : !startsRight)))
        const alignClass = isRight ? 'float-right' : 'float-left'
        const sizeClass = isBedHotspot ? 'size-small' : (imgObj.sizeClass || (imgObj.size === 'big' ? 'size-big' : 'size-small'))

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
          sizeClass,
          key: `article-img-${imgIdx}`
        })
      })

      const renderFigure = (imgObj, key) => {
        if (!imgObj?.src) return null
        const isVid = isVideoUrl(imgObj.src) || imgObj.type === 'video'
        let alignClass = imgObj.alignClass || (imgObj.placement === 'right' ? 'float-right' : imgObj.placement === 'center' ? 'float-center' : 'float-left')
        let sizeClass = imgObj.sizeClass || (imgObj.size === 'big' ? 'size-big' : 'size-small')

        let hotspotMeta = null
        if (isBedHotspot) {
          const vIndex = embeddedVideoCount++
          alignClass = vIndex % 2 === 0 ? 'float-right' : 'float-left'
          sizeClass = 'size-small'
          hotspotMeta = BED_HOTSPOT_VIDEOS[vIndex % BED_HOTSPOT_VIDEOS.length]
        }

        if (isVid) {
          const vidTitle = hotspotMeta ? hotspotMeta.title : (imgObj.caption || articleTitle)
          const vidSubtitle = hotspotMeta ? hotspotMeta.caption : undefined

          return (
            <figure key={key} className={`article-inline-figure ${alignClass} ${sizeClass} article-inline-video-figure`}>
              <div className="article-video-player-container">
                <VideoPlayer
                  src={imgObj.src}
                  poster={imgObj.poster || undefined}
                  autoPlay={false}
                  title={vidTitle}
                  subtitle={vidSubtitle}
                  category={hotspotMeta ? hotspotMeta.title : "Story Clip"}
                />
              </div>
              {(hotspotMeta || imgObj.caption) ? (
                <figcaption className="article-inline-caption">
                  {hotspotMeta ? (
                    <>
                      <strong>{hotspotMeta.title}</strong> &mdash; <span>{hotspotMeta.caption}</span>
                    </>
                  ) : imgObj.caption}
                </figcaption>
              ) : null}
            </figure>
          )
        }

        return (
          <figure key={key} className={`article-inline-figure ${alignClass} ${sizeClass}`}>
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
            const vIndex = embeddedVideoCount++
            const alignClass = isBedHotspot
              ? (vIndex % 2 === 0 ? 'size-small float-right bed-hotspot-video-right' : 'size-small float-left bed-hotspot-video-left')
              : ''
            const hotspotMeta = isBedHotspot ? BED_HOTSPOT_VIDEOS[vIndex % BED_HOTSPOT_VIDEOS.length] : null

            const matchedMedia = Array.isArray(storyImages)
              ? storyImages.find((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
              : null
            const explicitCaption = matchedMedia !== null && matchedMedia !== undefined
              ? (matchedMedia.caption || '')
              : (node.getAttribute('data-caption') || node.getAttribute('title') || '')

            const vidTitle = hotspotMeta ? hotspotMeta.title : (matchedMedia?.title || articleTitle)
            const vidSubtitle = hotspotMeta ? hotspotMeta.caption : (explicitCaption || undefined)

            return (
              <div key={key} className={`article-embedded-video-card ${alignClass}`}>
                <div className="article-video-player-container">
                  <VideoPlayer
                    src={src}
                    poster={poster}
                    autoPlay={false}
                    title={vidTitle}
                    subtitle={vidSubtitle}
                    category={hotspotMeta ? hotspotMeta.title : "Story Clip"}
                  />
                </div>
                {hotspotMeta ? (
                  <div className="article-embedded-video-caption">
                    <strong>{hotspotMeta.title}</strong> &mdash; <span>{hotspotMeta.caption}</span>
                  </div>
                ) : explicitCaption ? (
                  <div className="article-embedded-video-caption">
                    <span>{explicitCaption}</span>
                  </div>
                ) : null}
              </div>
            )
          }
        }

        // Node containing video child(ren)
        const videoEls = Array.from(node.querySelectorAll('video'))
        if (videoEls.length > 0) {
          return (
            <React.Fragment key={key}>
              {videoEls.map((vid, vSubIdx) => {
                const src =
                  vid.getAttribute('src') || vid.querySelector('source')?.getAttribute('src')
                const poster = vid.getAttribute('poster') || undefined
                if (!src) return null
                const vIndex = embeddedVideoCount++
                const alignClass = isBedHotspot
                  ? (vIndex % 2 === 0 ? 'size-small float-right bed-hotspot-video-right' : 'size-small float-left bed-hotspot-video-left')
                  : ''
                const hotspotMeta = isBedHotspot ? BED_HOTSPOT_VIDEOS[vIndex % BED_HOTSPOT_VIDEOS.length] : null

                const figcap = vid.closest('figure')?.querySelector('figcaption')
                const matchedMedia = Array.isArray(storyImages)
                  ? storyImages.find((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
                  : null
                const explicitCaption = matchedMedia !== null && matchedMedia !== undefined
                  ? (matchedMedia.caption || '')
                  : (figcap?.textContent?.trim() || vid.getAttribute('data-caption') || vid.getAttribute('title') || '')

                const vidTitle = hotspotMeta ? hotspotMeta.title : (matchedMedia?.title || articleTitle)
                const vidSubtitle = hotspotMeta ? hotspotMeta.caption : (explicitCaption || undefined)

                return (
                  <div key={`${key}-vid-${vSubIdx}`} className={`article-embedded-video-card ${alignClass}`}>
                    <div className="article-video-player-container">
                      <VideoPlayer
                        src={src}
                        poster={poster}
                        autoPlay={false}
                        title={vidTitle}
                        subtitle={vidSubtitle}
                        objectFit={src && src.includes('vcuwit1kzoa5rvnc2zee') ? 'cover' : 'contain'}
                        category={hotspotMeta ? hotspotMeta.title : "Story Clip"}
                      />
                    </div>
                    {hotspotMeta ? (
                      <div className="article-embedded-video-caption">
                        <strong>{hotspotMeta.title}</strong> &mdash; <span>{hotspotMeta.caption}</span>
                      </div>
                    ) : explicitCaption ? (
                      <div className="article-embedded-video-caption">
                        <span>{explicitCaption}</span>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </React.Fragment>
          )
        }

        // Node containing iframe(s) (e.g. video embed)
        const iframeEls = tagName === 'iframe' ? [node] : Array.from(node.querySelectorAll('iframe'))
        if (iframeEls.length > 0 && tagName !== 'p') {
          return (
            <React.Fragment key={key}>
              {iframeEls.map((iframe, ifIdx) => {
                const src = iframe.getAttribute('src')
                if (!src) return null
                const vIndex = embeddedVideoCount++
                const alignClass = isBedHotspot
                  ? (vIndex % 2 === 0 ? 'size-small float-right bed-hotspot-video-right' : 'size-small float-left bed-hotspot-video-left')
                  : ''
                const hotspotMeta = isBedHotspot ? BED_HOTSPOT_VIDEOS[vIndex % BED_HOTSPOT_VIDEOS.length] : null

                return (
                  <div key={`${key}-iframe-${ifIdx}`} className={`article-embedded-video-card ${alignClass}`}>
                    <iframe
                      src={src}
                      title={hotspotMeta ? hotspotMeta.title : articleTitle}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: isBedHotspot ? '220px' : '380px', borderRadius: '8px' }}
                    />
                    {hotspotMeta && (
                      <div className="article-embedded-video-caption">
                        <strong>{hotspotMeta.title}</strong> &mdash; <span>{hotspotMeta.caption}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          )
        }

        // In-place Figure Element
        if (tagName === 'figure') {
          const vid = node.querySelector('video')
          const img = node.querySelector('img')
          const figcaption = node.querySelector('figcaption')

          if (vid) {
            const src = vid.getAttribute('src') || vid.querySelector('source')?.getAttribute('src')
            if (!src) return null
            const poster = vid.getAttribute('poster') || undefined
            const vIndex = embeddedVideoCount++
            const alignClass = isBedHotspot
              ? (vIndex % 2 === 0 ? 'size-small float-right bed-hotspot-video-right' : 'size-small float-left bed-hotspot-video-left')
              : ''
            const hotspotMeta = isBedHotspot ? BED_HOTSPOT_VIDEOS[vIndex % BED_HOTSPOT_VIDEOS.length] : null
            const matchedMedia = Array.isArray(storyImages)
              ? storyImages.find((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
              : null
            const explicitCaption = matchedMedia !== null && matchedMedia !== undefined
              ? (matchedMedia.caption || '')
              : (figcaption?.textContent?.trim() || vid.getAttribute('data-caption') || vid.getAttribute('title') || '')
            const vidTitle = hotspotMeta ? hotspotMeta.title : (matchedMedia?.title || articleTitle)
            const vidSubtitle = hotspotMeta ? hotspotMeta.caption : (explicitCaption || undefined)

            return (
              <div key={key} className={`article-embedded-video-card ${alignClass}`}>
                <div className="article-video-player-container">
                  <VideoPlayer
                    src={src}
                    poster={poster}
                    autoPlay={false}
                    title={vidTitle}
                    subtitle={vidSubtitle}
                    objectFit={src && src.includes('vcuwit1kzoa5rvnc2zee') ? 'cover' : 'contain'}
                    category={hotspotMeta ? hotspotMeta.title : "Story Clip"}
                  />
                </div>
                {hotspotMeta ? (
                  <div className="article-embedded-video-caption">
                    <strong>{hotspotMeta.title}</strong> &mdash; <span>{hotspotMeta.caption}</span>
                  </div>
                ) : explicitCaption ? (
                  <div className="article-embedded-video-caption">
                    <span>{explicitCaption}</span>
                  </div>
                ) : null}
              </div>
            )
          }

          const src = img?.getAttribute('src')?.trim()
          if (!src) return null

          // If storyImages is an array and has items, drop figure if removed from storyImages
          if (Array.isArray(storyImages) && storyImages.length > 0) {
            const isPresent = storyImages.some((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
            if (!isPresent) return null
          }

          let caption =
            figcaption?.textContent?.trim() ||
            img?.getAttribute('alt') ||
            img?.getAttribute('title') ||
            ''
          let alignClass = 'float-left'
          let sizeClass = 'size-small'

          if (node.classList.contains('float-right')) alignClass = 'float-right'
          else if (node.classList.contains('float-center')) alignClass = 'float-center'
          else if (node.classList.contains('float-left')) alignClass = 'float-left'

          if (node.classList.contains('size-big')) sizeClass = 'size-big'
          else if (node.classList.contains('size-small')) sizeClass = 'size-small'

          if (Array.isArray(storyImages) && storyImages.length > 0) {
            const matched = storyImages.find((si) => isSameImage(typeof si === 'string' ? si : si.url, src))
            if (matched) {
              if (matched.caption !== undefined && matched.caption !== null) {
                caption = matched.caption
              }
              if (matched.placement) {
                alignClass = matched.placement === 'right' ? 'float-right' : matched.placement === 'center' ? 'float-center' : 'float-left'
              }
              if (matched.size) {
                sizeClass = matched.size === 'big' ? 'size-big' : 'size-small'
              }
            }
          }
          const alt = img?.getAttribute('alt') || caption || articleTitle

          return renderFigure({ src, caption, alt, alignClass, sizeClass }, key)
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

        // Ignore standalone figcaptions (already handled inside figures)
        if (tagName === 'figcaption') {
          return null
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
