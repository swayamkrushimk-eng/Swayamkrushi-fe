import { useState, useEffect } from 'react'
import { fetchInsiders } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import SEO from '../components/SEO'
import './InsidersPage.css'

const INITIAL_INSIDERS = [
  {
    id: 'd-dora-babu',
    name: 'Manjulaa Kalyaan',
    role: 'Founder and Director',
    videoUrl: 'https://res.cloudinary.com/ll9equhn/video/upload/v1791458704/swayamkrushi/videos/manjula_mam_video.mp4'
  },
  {
    id: 'vishnu-kondoj',
    name: 'DR.Shudhakar',
    role: 'Dean',
    videoUrl: 'https://res.cloudinary.com/ll9equhn/video/upload/v1791489534/swayamkrushi/hsbcfqtvackxinqxwj6u.mp4'
  },
  {
    id: 'sarada-sudhakar',
    name: 'Gp. Capt. T. Suresh',
    role: 'Secretary',
    videoUrl: 'https://res.cloudinary.com/ll9equhn/video/upload/v1791489805/swayamkrushi/xbrhvkwq3lnryzkqcdwi.mp4'
  }
]

export default function InsidersPage() {
  const [insiders, setInsiders] = useState(INITIAL_INSIDERS)

  // Fetch dynamic videos from backend API (matches live Admin portal items)
  useEffect(() => {
    fetchInsiders()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setInsiders(data)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <main className="insiders-page-wrap">
      <SEO
        title="What they have to say.... | Swayamkrushi"
        description="Watch inspiring video stories and interviews from special educators, speech therapists, alumni, parents, and leaders at Swayamkrushi."
        keywords="Swayamkrushi videos, special educator interviews, disability success stories, group home testimonials, Hyderabad NGO stories"
        canonicalUrl="https://swayamkrushi.org/#/insiders"
      />

      {/* Hero Header */}
      <header className="insiders-hero-header">
        <h1 className="insiders-main-title">What they have to say....</h1>
      </header>

      {/* Video Grid - Render only active posted stories */}
      <section className="insiders-video-grid-2x2" aria-label="Video Testimonials Grid">
        {insiders.map((item) => {
          const hasQuote =
            item.quote &&
            typeof item.quote === 'string' &&
            item.quote.replace(/["'“”\s]/g, '').trim().length > 0

          const cleanQuote = hasQuote
            ? item.quote.replace(/^["'“”\s]+|["'“”\s]+$/g, '').trim()
            : ''

          const hasDesc =
            item.description &&
            typeof item.description === 'string' &&
            item.description.trim().length > 0

          return (
            <article key={item._id || item.id} className="insider-video-card-direct">
              {/* Video Player Container */}
              <div className="insider-video-player-container">
                <VideoPlayer
                  src={item.videoUrl}
                  poster={item.thumbnail || undefined}
                  title={item.name}
                  subtitle={item.role}
                  aspectRatio="16/9"
                  objectFit="cover"
                />
              </div>

              {/* Speaker Metadata */}
              <div className="insider-video-card-meta">
                <h3 className="insider-card-speaker-name">{item.name}</h3>
                <p className="insider-card-speaker-role">{item.role}</p>

                {hasQuote && (
                  <blockquote className="insider-card-quote">
                    “{cleanQuote}”
                  </blockquote>
                )}

                {hasDesc && (
                  <p className="insider-card-description">
                    {item.description.trim()}
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
