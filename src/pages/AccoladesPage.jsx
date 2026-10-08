import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { featuredAccolade as defaultFeatured, timelineAccolades as defaultTimeline, certificateGallery as defaultGallery } from '../data/accoladesData'
import { fetchAccolades } from '../services/api'
import SEO from '../components/SEO'
import './AccoladesPage.css'

export default function AccoladesPage() {
  const [featured, setFeatured] = useState(defaultFeatured)
  const [timeline, setTimeline] = useState(defaultTimeline)
  const [certificates, setCertificates] = useState(defaultGallery)
  const [expandedItems, setExpandedItems] = useState({})
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchAccolades().then((data) => {
      if (data) {
        if (data.featured) {
          setFeatured((prev) => ({
            ...prev,
            ...data.featured,
            images: prev.images
          }))
        }
        if (data.timeline && data.timeline.length > 0) {
          setTimeline(data.timeline.map((item, idx) => ({
            ...(defaultTimeline[idx] || {}),
            ...item,
            image: item.imageUrl ? { src: item.imageUrl, label: item.imageLabel || item.title } : (defaultTimeline[idx]?.image)
          })))
        }
        if (data.certificates && data.certificates.length > 0) {
          setCertificates(data.certificates.map((item, idx) => ({
            ...(defaultGallery[idx] || {}),
            ...item,
            src: item.imageUrl || defaultGallery[idx]?.src
          })))
        }
      }
    })
  }, [])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxImage) return
      if (e.key === 'Escape') {
        setLightboxImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxImage])

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const openLightbox = (imageObj) => {
    setLightboxImage(imageObj)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  return (
    <div className="accolades-page-wrap">
      <SEO
        title="Accolades & National Awards | 35+ Years of Recognition"
        description="Discover Swayamkrushi's 35+ year history of national and state recognition, including four National Awards from the President and Prime Minister of India for excellence in special education."
        keywords="Swayamkrushi awards, National Award for Child Welfare, National Award Best Institution, Manjula Kalyan recognition, special education achievements"
        canonicalUrl="https://swayamkrushi.org/#/accolades"
      />
      {/* Top Breadcrumb */}
      <nav className="accolades-breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Accolades & Recognition</span>
      </nav>

      {/* 1. Hero / Introduction */}
      <header className="accolades-hero-header">
        <div className="accolades-badge">
          <span className="accolades-badge-dot" />
          <span>RECOGNITION / ACCOLADES</span>
        </div>
        <h1 className="accolades-main-headline">
          Three-and-half decades of hard work, and the consequent recognition
        </h1>
        <p className="accolades-intro-lead">
          Every award below, including four at the national level, is a testament to the lives changed,
          educators trained, and communities transformed by Swayamkrushi and its founder, Manjulaa Kalyaan.
        </p>
      </header>

      {/* 2. Featured Recognition: 2002 National Award */}
      <section className="accolades-featured-section" aria-label="Featured Recognition">
        <div className="featured-card">
          <div className="featured-content-col">
            <div className="featured-year-pill">{featured.year} · {featured.badge}</div>
            <h2 className="featured-title">{featured.title}</h2>
            <p className="featured-presenter">{featured.presenter}</p>
            <p className="featured-byline">{featured.presentedBy}</p>

            <p className="featured-desc">
              {expandedItems[featured.id]
                ? featured.fullDesc
                : featured.shortDesc}
            </p>

            <button
              type="button"
              className="accolades-expand-btn"
              onClick={() => toggleExpand(featured.id)}
            >
              {expandedItems[featured.id] ? '← Show summary' : 'Read full citation →'}
            </button>
          </div>

          <div className="featured-media-col">
            <div
              className="featured-main-img-wrap"
              onClick={() => openLightbox({ src: featured.images[0].src, title: featured.title, caption: featured.images[0].label })}
              title="Click to view full certificate"
            >
              <img
                src={featured.images[0].src}
                alt={featured.images[0].label}
                className="featured-img"
              />
              <span className="img-zoom-hint">View Certificate</span>
            </div>

            <div className="featured-thumbs-row">
              {featured.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="featured-thumb-btn"
                  onClick={() => openLightbox({ src: img.src, title: featured.title, caption: img.label })}
                  title={img.label}
                >
                  <img src={img.src} alt={img.label} />
                  <span>{img.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="accolades-section-divider">
        <span>CHRONOLOGICAL RECOGNITION TIMELINE</span>
      </div>

      {/* 3. Alternating Editorial Timeline Rows */}
      <section className="accolades-timeline-section" aria-label="Awards Timeline">
        {timeline.map((award, index) => {
          const isEven = index % 2 === 0
          const isExpanded = !!expandedItems[award.id]

          return (
            <article
              key={award.id}
              className={`timeline-row ${isEven ? 'row-text-left' : 'row-text-right'}`}
            >
              <div className="timeline-text-col">
                <div className="timeline-year-badge">
                  <span className="timeline-year">{award.year}</span>
                  {award.badge && <span className="timeline-tag">{award.badge}</span>}
                </div>

                <h3 className="timeline-title">{award.title}</h3>
                <p className="timeline-presenter">{award.presenter}</p>
                {award.presentedBy && <p className="timeline-byline">{award.presentedBy}</p>}

                <p className="timeline-desc">
                  {isExpanded ? award.fullDesc : award.shortDesc}
                </p>

                <button
                  type="button"
                  className="accolades-expand-btn"
                  onClick={() => toggleExpand(award.id)}
                >
                  {isExpanded ? '← Show summary' : 'Read full recognition →'}
                </button>
              </div>

              <div className="timeline-media-col">
                {award.image && (
                  <div
                    className="timeline-img-card"
                    onClick={() => openLightbox({ src: award.image.src, title: award.title, caption: award.image.label })}
                    title="Click to view document"
                  >
                    <img
                      src={award.image.src}
                      alt={award.image.label}
                      className="timeline-img"
                      loading="lazy"
                    />
                    <div className="timeline-img-caption">
                      <span>{award.image.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </section>

      {/* 4. Certificate Gallery (Separate Section at Bottom) */}
      <section className="certificate-gallery-section" id="certificates">
        <header className="gallery-header">
          <div className="gallery-kicker">ARCHIVAL COLLECTION</div>
          <h2 className="gallery-title">CERTIFICATE GALLERY</h2>
          <p className="gallery-subtitle">Original certificates, plaques & citations</p>
          <p className="gallery-hint">
            Click any certificate below to view the high-resolution scanned document in full screen.
          </p>
        </header>

        <div className="gallery-grid">
          {certificates.map((item, idx) => (
            <div
              key={idx}
              className="gallery-card"
              onClick={() => openLightbox({ src: item.src, title: item.title, caption: item.caption })}
            >
              <div className="gallery-img-wrap">
                <img
                  src={item.src}
                  alt={item.title}
                  className="gallery-thumb-img"
                  loading="lazy"
                />
                <span className="gallery-zoom-badge">View Document</span>
              </div>
              <div className="gallery-meta">
                <span className="gallery-year">{item.year}</span>
                <h4 className="gallery-item-title">{item.title}</h4>
                <p className="gallery-item-caption">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="accolades-lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close certificate viewer"
            >
              &times;
            </button>
            <div className="lightbox-img-holder">
              <img src={lightboxImage.src} alt={lightboxImage.title || 'Certificate'} />
            </div>
            <div className="lightbox-caption-bar">
              <h4>{lightboxImage.title}</h4>
              {lightboxImage.caption && <p>{lightboxImage.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
