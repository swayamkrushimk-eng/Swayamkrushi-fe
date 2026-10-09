import { useState, useEffect } from 'react'
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
          setEventImages(data)
        }
      })
      .catch((err) => {
        console.warn('Error loading event images:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <main className="events-page-wrap">
      <SEO
        title="Events | Swayamkrushi"
        description="Event photo gallery and celebrations at Swayamkrushi."
        canonicalUrl="https://swayamkrushi.org/#/events"
      />

      {/* Editorial Header */}
      <header className="events-header">
        <h1 className="events-title">Events</h1>
      </header>

      {/* Image Gallery */}
      {loading ? (
        <div className="events-loading">
          <p>Loading events...</p>
        </div>
      ) : eventImages.length === 0 ? (
        <div className="events-empty-state">
          <div className="events-empty-icon">📷</div>
          <p>No event images uploaded yet.</p>
        </div>
      ) : (
        <div className="events-gallery-grid">
          {eventImages.map((item, idx) => {
            const imgUrl = item.imageUrl || item.url || item.image || item.src
            if (!imgUrl) return null
            const title = item.title || item.caption || `Event Photo ${idx + 1}`

            return (
              <div
                key={item._id || item.id || idx}
                className="events-gallery-item"
                onClick={() => setLightboxImage({ src: imgUrl, title })}
              >
                <img
                  src={imgUrl}
                  alt={title}
                  loading="lazy"
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
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
          </div>
        </div>
      )}
    </main>
  )
}
