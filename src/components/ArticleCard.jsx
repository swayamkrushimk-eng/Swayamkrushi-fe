import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { articleImagesMap } from '../data/allArticles'
import { resolveArticleMedia } from '../utils/mediaUtils'

export default function ArticleCard(props) {
  const {
    id,
    title,
    excerpt,
    attribution,
    image,
    imageUrl,
    imageAlt,
    hasThumbnail,
    showThumbnail,
    mediaType,
    featuredMediaType,
    videoUrl,
    videoThumbnailUrl,
    videoPosterUrl
  } = props

  const isThumbnailSettingEnabled =
    hasThumbnail !== false &&
    hasThumbnail !== 'false' &&
    showThumbnail !== false &&
    showThumbnail !== 'false'

  const localFallback = isThumbnailSettingEnabled ? (articleImagesMap[id] || image || null) : null
  const mediaInfo = resolveArticleMedia(props, localFallback)

  const [currentPoster, setCurrentPoster] = useState(mediaInfo.posterUrl)

  useEffect(() => {
    if (!isThumbnailSettingEnabled || mediaInfo.isText) {
      setCurrentPoster(null)
    } else {
      setCurrentPoster(mediaInfo.posterUrl || localFallback)
    }
  }, [
    imageUrl,
    videoUrl,
    videoPosterUrl,
    videoThumbnailUrl,
    mediaType,
    featuredMediaType,
    id,
    localFallback,
    isThumbnailSettingEnabled,
    mediaInfo.posterUrl,
    mediaInfo.isText
  ])

  const handleError = () => {
    if (isThumbnailSettingEnabled && localFallback && currentPoster !== localFallback) {
      setCurrentPoster(localFallback)
    } else {
      setCurrentPoster(null)
    }
  }

  const shouldRenderThumbnail =
    isThumbnailSettingEnabled && !mediaInfo.isText && (Boolean(currentPoster) || mediaInfo.isVideo)

  return (
    <Link
      to={`/article/${id}`}
      className={`rail-item ${mediaInfo.isVideo ? 'rail-item-video-card' : ''}`}
      id={id}
    >
      {shouldRenderThumbnail && (
        <div className="rail-thumb-container">
          {currentPoster ? (
            <img
              src={currentPoster}
              alt={imageAlt || title}
              onError={handleError}
              loading="lazy"
              className="rail-thumb-img"
            />
          ) : (
            <div className="rail-video-placeholder-thumb">
              <div className="rail-video-play-center-btn" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </div>
            </div>
          )}

          {/* Video Play Overlay & Badge */}
          {mediaInfo.isVideo && (
            <>
              <div className="rail-video-play-center-btn" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </div>
              <div className="rail-video-badge-pill" aria-label="Video story">
                <svg className="rail-video-pill-icon" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
                <span>VIDEO</span>
              </div>
            </>
          )}
        </div>
      )}

      <h4>{title}</h4>
      <p>{excerpt}</p>
      {attribution && <p className="rail-attrib">&mdash; {attribution}</p>}
      <span className="rail-more">{mediaInfo.isVideo ? 'Watch & read story →' : 'Read more'}</span>
    </Link>
  )
}
