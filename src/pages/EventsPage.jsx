import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { fetchEventImages } from '../services/api'
import './EventsPage.css'

export default function EventsPage() {
  const [eventImages, setEventImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchEventImages()
      .then((data) => {
        if (Array.isArray(data)) {
          setEventImages(data.filter((item) => item.imageUrl || item.url || item.image || item.src))
        }
      })
      .catch((err) => {
        console.warn('Error loading event images:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxImage(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="events-page-wrap">
      <SEO
        title="Events Gallery | Swayamkrushi"
        description="Photos from celebrations, campus days, and special events at Swayamkrushi."
        canonicalUrl="https://swayamkrushi.org/#/events"
      />

      <nav className="events-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Events Gallery</span>
      </nav>

      <header className="events-header">
        <p className="events-kicker">Campus life</p>
        <h1 className="events-title">Events Gallery</h1>
        <p className="events-subtitle">
          Moments from celebrations, visits, and everyday life at Swayamkrushi.
        </p>
      </header>

      {loading ? (
        <div className="events-loading">
          <p>Loading gallery…</p>
        </div>
      ) : eventImages.length === 0 ? (
        <div className="events-empty-state">
          <div className="events-empty-icon">📷</div>
          <p>No event photos yet. New images added from the admin gallery will appear here.</p>
        </div>
      ) : (
        <div className="events-gallery-grid">
          {eventImages.map((item, idx) => {
            const imgUrl = item.imageUrl || item.url || item.image || item.src
            const title = item.title || item.caption || `Event photo ${idx + 1}`
            const caption = item.caption && item.caption !== title ? item.caption : ''

            return (
              <button
                type="button"
                key={item._id || item.id || idx}
                className="events-gallery-item"
                onClick={() => setLightboxImage({ src: imgUrl, title, caption })}
              >
                <img src={imgUrl} alt={title} loading="lazy" />
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

      {lightboxImage && (
        <div className="events-lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="events-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="events-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close image viewer"
            >
              ✕
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="events-lightbox-img"
            />
            {(lightboxImage.title || lightboxImage.caption) && (
              <p className="events-lightbox-caption">
                {lightboxImage.title}
                {lightboxImage.caption ? ` — ${lightboxImage.caption}` : ''}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
