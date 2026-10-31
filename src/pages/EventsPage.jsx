import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import { fetchEventImages } from '../services/api'
import { isVideoUrl, getPlayableVideoUrl, getVideoThumbnailUrl } from '../utils/mediaUtils'
import './EventsPage.css'

function mediaSrc(item) {
  return item?.imageUrl || item?.url || item?.image || item?.src || item?.videoUrl || ''
}

function itemIsVideo(item) {
  return item?.mediaType === 'video' || isVideoUrl(mediaSrc(item))
}

export default function EventsPage() {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxItem, setLightboxItem] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchEventImages()
      .then((data) => {
        if (Array.isArray(data)) {
          setGalleryItems(data.filter((item) => mediaSrc(item)))
        }
      })
      .catch((err) => {
        console.warn('Error loading event gallery:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxItem(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="events-page-wrap">
      <SEO
        title="Events Gallery | Swayamkrushi"
        description="Photos and videos from celebrations, campus days, and special events at Swayamkrushi."
        canonicalUrl="https://swayamkrushi.org/#/events"
      />

      <header className="events-header">
        <h1 className="events-title">Events Gallery</h1>
        <p className="events-subtitle">
          Moments from celebrations, visits, and everyday life at Swayamkrushi.
        </p>
      </header>

      {loading ? (
        <div className="events-loading">
          <p>Loading gallery…</p>
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="events-empty-state">
          <div className="events-empty-icon">📷</div>
          <p>No photos or videos yet. New media added from the admin gallery will appear here.</p>
        </div>
      ) : (
        <div className="events-gallery-grid">
          {galleryItems.map((item, idx) => {
            const src = mediaSrc(item)
            const isVideo = itemIsVideo(item)
            const title = item.title || item.caption || (isVideo ? `Event video ${idx + 1}` : `Event photo ${idx + 1}`)
            const caption = item.caption && item.caption !== title ? item.caption : ''
            const poster = item.videoThumbnailUrl || getVideoThumbnailUrl(src) || ''
            const playable = isVideo ? getPlayableVideoUrl(src) : src

            return (
              <button
                type="button"
                key={item._id || item.id || idx}
                className="events-gallery-item"
                onClick={() => setLightboxItem({ src: playable, poster, title, caption, isVideo })}
              >
                {isVideo ? (
                  poster ? (
                    <img src={poster} alt={title} loading="lazy" />
                  ) : (
                    <video src={playable} muted playsInline preload="metadata" />
                  )
                ) : (
                  <img src={src} alt={title} loading="lazy" />
                )}
                {isVideo && <span className="events-play-badge" aria-hidden="true">▶</span>}
                {(item.title || caption) && (
                  <span className="events-gallery-caption">
                    <strong>{item.title || title}</strong>
                    {caption ? <em>{caption}</em> : null}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {lightboxItem && (
        <div className="events-lightbox-overlay" onClick={() => setLightboxItem(null)}>
          <div className="events-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="events-lightbox-close"
              onClick={() => setLightboxItem(null)}
              aria-label="Close gallery viewer"
            >
              ✕
            </button>
            {lightboxItem.isVideo ? (
              <video
                src={lightboxItem.src}
                poster={lightboxItem.poster || undefined}
                className="events-lightbox-video"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={lightboxItem.src}
                alt={lightboxItem.title}
                className="events-lightbox-img"
              />
            )}
            {(lightboxItem.title || lightboxItem.caption) && (
              <p className="events-lightbox-caption">
                {lightboxItem.title}
                {lightboxItem.caption ? ` — ${lightboxItem.caption}` : ''}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
