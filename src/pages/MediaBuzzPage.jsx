import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { fetchMediaBuzz } from '../services/api'
import hinduClipping from '../assets/images/hindu-35-years-clipping.jpg'
import './MediaBuzzPage.css'

export const MEDIA_ARTICLES = [
  {
    id: 'hindu-35-years-milestone',
    title: 'NGO Celebrates 35 Years of Serving Persons with Intellectual Disabilities',
    outlet: 'The Hindu',
    outletType: 'Print & Newspapers',
    date: 'August 2026',
    category: 'Newspaper Clipping',
    badge: 'THE HINDU SPOTLIGHT',
    image: hinduClipping,
    isClipping: true,
    excerpt: 'Swayamkrushi, a Hyderabad-based non-profit organisation working for persons with intellectual disabilities, is celebrating 35 years of service with a focus on education, vocational training and independent living. Founder Manjula Kalyan was felicitated by dignitaries.',
    readTime: 'Newspaper Report',
    tags: ['The Hindu', '35th Anniversary', 'Founder Felicitation', 'Special Education'],
    articleUrl: 'https://share.google/YhznuCLOlokk6iVY6',
    featured: true
  },
  {
    id: 'newsmeter-classrooms-to-careers',
    title: 'From Classrooms to Careers, Hyderabad’s Swayamkrushi Has Been Empowering Lives for Over 3 Decades',
    outlet: 'NewsMeter',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'In-Depth Feature',
    badge: 'FEATURE STORY',
    image: null,
    isClipping: false,
    excerpt: 'A comprehensive investigation into how Swayamkrushi nurtures children with intellectual challenges into self-reliant adults equipped with job skills, emotional independence, and dignified careers across corporate and creative fields.',
    readTime: '5 min read',
    tags: ['NewsMeter', 'Career Transitions', 'Vocational Training', '3 Decades'],
    articleUrl: 'https://newsmeter.in/hyderabad/from-classrooms-to-careers-hyderabads-swayamkrushi-has-been-empowering-lives-for-over-3-decades-772608',
    featured: true
  },
  {
    id: 'telangana-today-35-years',
    title: 'Swayamkrushi Marks 35 Years of Empowering Persons with Intellectual Disabilities',
    outlet: 'Telangana Today',
    outletType: 'Print & Newspapers',
    date: 'August 2026',
    category: 'E-Paper & Print',
    badge: 'TELANGANA TODAY',
    image: null,
    isClipping: false,
    excerpt: 'Telangana Today spotlights the 35th-anniversary celebration of Swayamkrushi, highlighting the school, women’s group homes, and university-affiliated B.Ed Special Education collegiate institution.',
    readTime: 'E-Paper Edition',
    tags: ['Telangana Today', '35 Years', 'Hyderabad District', 'Special Education'],
    articleUrl: 'https://epaper.telanganatoday.com/article/Hyderabad?OrgId=30830d8e731&imageview=1&standalone=1&device=mobile',
    shareUrl: 'https://share.google/hr29E4yqbsxGLYhfz',
    featured: true
  },
  {
    id: 'sakshi-hyderabad-district',
    title: 'Sakshi Hyderabad District Edition: 35 ఏళ్ల స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Sakshi Telugu Daily',
    outletType: 'Print & Newspapers',
    date: '09/08/2026',
    category: 'Regional Press',
    badge: 'SAKSHI E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'సాక్షి హైదరాబాద్ ఎడిషన్ కథనం: మూడున్నర దశాబ్దాలుగా మానసిక వికలాంగుల వికాసం, విద్యాబోధన, జీవనోపాధి కల్పిస్తున్న స్వయంకృషి సంస్థ సేవలు ఆదర్శనీయం.',
    readTime: 'Telugu E-Paper',
    tags: ['Sakshi Daily', 'Telugu E-Paper', 'District Edition', 'Residential Care'],
    articleUrl: 'https://epaper.sakshi.com/Hyderabad_District?eid=123&edate=09/08/2026&pgid=916473&device=desktop&view=3',
    shareUrl: 'https://share.google/eUEsCRt1PCmGTv3wc',
    featured: false
  },
  {
    id: 'newsmeter-bharati-saini-art',
    title: 'Art Without Limits: Uttarakhand Artist Bharati Saini Turns Elbow Stumps into Tools for Painting',
    outlet: 'NewsMeter',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Fine Arts & Inclusion',
    badge: 'HUMAN IMPACT',
    image: null,
    isClipping: false,
    excerpt: 'An inspiring profile on artist Bharati Saini, who triumphed over adversity to produce breathtaking paintings, highlighting the boundless creative potential fostered within the Swayamkrushi family.',
    readTime: '4 min read',
    tags: ['Fine Arts', 'Inspiring Story', 'NewsMeter', 'Creative Vocational'],
    articleUrl: 'https://newsmeter.in/lifestyle/art-without-limits-uttarakhand-artist-bharati-saini-turns-elbow-stumps-into-tools-for-painting-774531',
    featured: false
  },
  {
    id: 'telangana-today-digital-archive',
    title: 'Swayamkrushi Marks 35 Years Of Empowering Persons With Disabilities',
    outlet: 'Telangana Today Digital',
    outletType: 'Digital & Magazines',
    date: 'August 2026',
    category: 'Online Edition',
    badge: 'DIGITAL NEWS',
    image: null,
    isClipping: false,
    excerpt: 'Digital media report on the anniversary convention celebrating 35 years of inclusive education, parent support programs, vocational crafts, and independent living.',
    readTime: '3 min read',
    tags: ['Digital Press', 'Telangana Today', 'Milestone Celebration'],
    articleUrl: 'https://share.google/qjsO3mphDfJO4K8o3',
    featured: false
  }
]

const MEDIA_TYPES = [
  { id: 'all', label: 'All Coverage' },
  { id: 'print', label: 'Print & Newspapers' },
  { id: 'digital', label: 'Digital & Magazines' }
]

export default function MediaBuzzPage() {
  const [articlesList, setArticlesList] = useState(MEDIA_ARTICLES)
  const [activeType, setActiveType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadBuzz() {
      try {
        const data = await fetchMediaBuzz()
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((a) => {
            if (a.id === 'hindu-35-years-milestone' && (!a.image || a.image === 'hinduClipping')) {
              return { ...a, image: hinduClipping }
            }
            return a
          })
          setArticlesList(mapped)
        } else {
          localStorage.setItem('swayamkrushi_media_buzz', JSON.stringify(MEDIA_ARTICLES))
        }
      } catch (err) {
        console.warn('Error loading media buzz:', err)
      }
    }
    loadBuzz()
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

  const filteredArticles = useMemo(() => {
    return articlesList.filter((article) => {
      const matchType =
        activeType === 'all' ||
        (activeType === 'print' && article.outletType === 'Print & Newspapers') ||
        (activeType === 'digital' && article.outletType === 'Digital & Magazines')

      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        (article.title && article.title.toLowerCase().includes(q)) ||
        (article.outlet && article.outlet.toLowerCase().includes(q)) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(q)) ||
        (article.tags && Array.isArray(article.tags) && article.tags.some((t) => t.toLowerCase().includes(q)))

      return matchType && matchSearch
    })
  }, [articlesList, activeType, searchQuery])

  return (
    <>
      <SEO
        title="Media Buzz & Press Coverage | Swayamkrushi"
        description="Explore press clippings, news features, e-paper editions, and media coverage celebrating 35+ years of Swayamkrushi NGO."
      />

      <div className="media-buzz-wrap">
        {/* Masthead Header */}
        <header className="media-buzz-header">
          <div className="buzz-kicker">
            <span className="buzz-dot" />
            <span>PRESS RELEASES · NEWSPAPER CLIPPINGS · EDITORIAL SPOTLIGHTS</span>
          </div>
          <h1 className="buzz-headline">Media Buzz</h1>
        </header>

        {/* Filter Controls Bar */}
        <div className="buzz-controls-bar">
          <div className="buzz-tabs-nav" role="tablist">
            {MEDIA_TYPES.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`buzz-tab-btn ${activeType === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveType(tab.id)}
                role="tab"
                aria-selected={activeType === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="buzz-search-box">
            <svg className="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search news, topics, or outlets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search media buzz"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Media Coverage Grid */}
        <div className="buzz-articles-grid">
          {filteredArticles.map((article) => (
            <article key={article.id} className={`buzz-article-card ${!article.image ? 'no-image-card' : ''}`}>
              {article.image && (
                <div
                  className={`buzz-card-media ${article.isClipping ? 'is-clipping-card' : ''}`}
                  onClick={() => {
                    if (article.isClipping) {
                      setLightboxImage({ src: article.image, title: article.title })
                    }
                  }}
                >
                  <img src={article.image} alt={article.title} className="buzz-card-img" />
                  <span className="buzz-outlet-badge">{article.outlet}</span>
                  {article.isClipping && (
                    <span className="clipping-zoom-hint">🔍 Zoom</span>
                  )}
                </div>
              )}
              <div className="buzz-card-body">
                {!article.image && (
                  <div className="card-top-outlet-bar">
                    <span className="buzz-outlet-badge inline">{article.outlet}</span>
                    <span className="buzz-card-category">{article.badge}</span>
                  </div>
                )}
                <div className="buzz-card-meta">
                  {article.image && <span className="buzz-card-category">{article.badge}</span>}
                  <span className="buzz-card-date">{article.date} · {article.readTime}</span>
                </div>
                <h3 className="buzz-card-title">{article.title}</h3>
                <p className="buzz-card-excerpt">{article.excerpt}</p>
                <div className="buzz-card-footer">
                  <div className="buzz-tags-row">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className="buzz-tag-pill">{tag}</span>
                    ))}
                  </div>
                  {article.articleUrl && (
                    <a
                      href={article.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="buzz-card-link-btn"
                    >
                      Read on {article.outlet} &rarr;
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="no-buzz-found">
            <p>No media articles found matching &ldquo;{searchQuery}&rdquo;.</p>
            <button
              type="button"
              className="reset-filter-btn"
              onClick={() => {
                setActiveType('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Media Press Kit & Relations Section */}
        <section className="press-relations-section">
          <div className="press-relations-inner">
            <div className="press-icon">&#128240;</div>
            <div className="press-content">
              <h3>Media Relations & Press Kit</h3>
              <p>
                For press inquiries, documentary interviews with Dr. Manjulaa Kalyaan, high-resolution photography assets, or campus visit permissions, please contact our media coordinator.
              </p>
              <div className="press-contact-bar">
                <Link to="/contact" className="press-contact-btn solid">
                  Contact Media Desk &rarr;
                </Link>
                <a
                  href="https://share.google/YhznuCLOlokk6iVY6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press-contact-btn hollow"
                >
                  View Complete Press Archive &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox Modal for Full-Size Newspaper Clipping */}
      {lightboxImage && (
        <div
          className="buzz-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="buzz-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="buzz-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close Lightbox"
            >
              &times;
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="buzz-lightbox-image"
            />
            <div className="buzz-lightbox-caption">
              <h3>{lightboxImage.title}</h3>
              <p>The Hindu Newspaper Bureau · Hyderabad Special Report</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
