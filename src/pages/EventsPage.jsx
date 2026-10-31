import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import { fetchEventImages } from '../services/api'
import { isVideoUrl, getPlayableVideoUrl, getVideoThumbnailUrl } from '../utils/mediaUtils'
import './EventsPage.css'

function mediaSrc(item) {
  return item?.url || item?.imageUrl || item?.image || item?.src || item?.videoUrl || ''
}

function itemIsVideo(item) {
  return item?.mediaType === 'video' || isVideoUrl(mediaSrc(item))
}

function toAlbums(data) {
  if (!Array.isArray(data)) return []
  return data
    .map((item) => {
      const media = Array.isArray(item.media) && item.media.length
        ? item.media.filter((file) => mediaSrc(file))
        : mediaSrc(item)
          ? [
              {
                url: mediaSrc(item),
                mediaType: item.mediaType === 'video' || isVideoUrl(mediaSrc(item)) ? 'video' : 'image',
                videoThumbnailUrl: item.videoThumbnailUrl || ''
              }
            ]
          : []
      return {
        ...item,
        title: item.title || 'Event',
        media
      }
    })
    .filter((album) => album.media.length)
}

export default function EventsPage() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxItem, setLightboxItem] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchEventImages()
      .then((data) => {
        setAlbums(toAlbums(data))
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
        description="Photos and videos from events and celebrations at Swayamkrushi."
        canonicalUrl="https://swayamkrushi.org/#/events"
      />

      <header className="events-header">
        <h1 className="events-title">Events Gallery</h1>
      </header>

      {loading ? (
        <div className="events-loading">
          <p>Loading gallery…</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="events-empty-state">
          <div className="events-empty-icon">📷</div>
          <p>No events yet. New albums added from the admin gallery will appear here.</p>
        </div>
      ) : (
        albums.map((album, albumIdx) => (
          <section className="events-album" key={album._id || album.id || albumIdx}>
            <h2 className="events-album-title">{album.title}</h2>
            <div className="events-gallery-grid">
              {album.media.map((item, idx) => {
                const src = mediaSrc(item)
                const isVideo = itemIsVideo(item)
                const poster = item.videoThumbnailUrl || getVideoThumbnailUrl(src) || ''
                const playable = isVideo ? getPlayableVideoUrl(src) : src

                return (
                  <button
                    type="button"
                    key={item._id || src || idx}
                    className="events-gallery-item"
                    onClick={() =>
                      setLightboxItem({
                        src: playable,
                        poster,
                        title: album.title,
                        isVideo
                      })
                    }
                  >
                    {isVideo ? (
                      poster ? (
                        <img src={poster} alt={album.title} loading="lazy" />
                      ) : (
                        <video src={playable} muted playsInline preload="metadata" />
                      )
                    ) : (
                      <img src={src} alt={album.title} loading="lazy" />
                    )}
                    {isVideo && <span className="events-play-badge" aria-hidden="true">▶</span>}
                  </button>
                )
              })}
            </div>
          </section>
        ))
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
            {!lightboxItem.isVideo && lightboxItem.title && (
              <p className="events-lightbox-caption">{lightboxItem.title}</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
