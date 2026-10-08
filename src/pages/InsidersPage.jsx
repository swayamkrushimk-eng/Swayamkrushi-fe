import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchInsiders } from '../services/api'
import VideoPlayer from '../components/VideoPlayer'
import SEO from '../components/SEO'
import './InsidersPage.css'

// Image imports for local fallbacks
import manjulaPortrait from '../assets/images/manjula-portrait.png'
import circleFacilitator from '../assets/images/circle-facilitator.jpg'
import heroSidePhoto from '../assets/images/hero-side-photo.png'
import nationalTrustImg from '../assets/images/national-trust-event.jpg'
import grouphomeResidents from '../assets/images/grouphome-residents.jpg'
import birthdayCourtyard from '../assets/images/birthday-courtyard.jpg'
import circleIncluded from '../assets/images/circle-included.jpg'
import circleLeft from '../assets/images/circle-left.jpg'

const LOCAL_THUMBNAILS = {
  'manjula-kalyan': manjulaPortrait,
  'd-dora-babu': circleFacilitator,
  'vishnu-kondoj': heroSidePhoto,
  'sarada-sudhakar': nationalTrustImg,
  'g-aruna': grouphomeResidents,
  'bharati-saini': birthdayCourtyard,
  'j-srilata': circleIncluded,
  'group-home-care': circleLeft
}

const INITIAL_INSIDERS = [
  {
    id: 'manjula-kalyan',
    name: 'Ms Manjula Kalyan',
    role: 'Founder & Director, Swayamkrushi',
    category: 'Educators & Staff',
    tag: 'FOUNDER REFLECTIONS',
    orgBadge: 'DIRECTOR',
    duration: '3:45',
    thumbnail: manjulaPortrait,
    videoUrl: '',
    quote: 'Every child deserves to live their best life. We don’t just teach them daily routines; we give them dignity, pride, and an eternal family.',
    description: 'Founder-director Manjula Kalyan recounts the journey from starting with just two girls in a rented house in 1991 to building five-acre group homes, four national awards, and a university-affiliated B.Ed college.'
  },
  {
    id: 'd-dora-babu',
    name: 'D Dora Babu',
    role: 'Speech Therapist & Special Educator',
    category: 'Therapists',
    tag: 'SPEECH THERAPY INSIGHT',
    orgBadge: 'CLINIC',
    duration: '2:18',
    thumbnail: circleFacilitator,
    videoUrl: '',
    quote: 'My lifelong effort is to defeat silence in these children. When 15-year-old Sai uttered "Amma" for the first time, tears rolled down my cheeks.',
    description: 'Dora Babu explains the intensive oral motor exercises, phonetics, and mirror tools used at Swayamkrushi to help children with dual hearing and intellectual challenges discover their voice.'
  },
  {
    id: 'vishnu-kondoj',
    name: 'Vishnu Kondoj',
    role: 'Lead Graphic Designer at Tech Mahindra & Founder, Masterbrush',
    category: 'Alumni & Trainees',
    tag: 'ALUMNI SPOTLIGHT',
    orgBadge: 'ALUMNUS',
    duration: '3:13',
    thumbnail: heroSidePhoto,
    videoUrl: '',
    quote: 'From delivering milk as a teenager to designing across Europe with Tech Mahindra — Manjula Madam gave me wings and taught me that grit conquers every hurdle.',
    description: 'Vishnu shares how Swayamkrushi nurtured his artistic spark, leading to international design projects, a career at Tech Mahindra, and the founding of Masterbrush Art Foundation for disabled artists.'
  },
  {
    id: 'sarada-sudhakar',
    name: 'M Sarada & Dr PVB Sudhakar',
    role: 'Principal & HOD, B.Ed Special Education College',
    category: 'Educators & Staff',
    tag: 'ACADEMIC EXCELLENCE',
    orgBadge: 'B.ED COLLEGE',
    duration: '2:06',
    thumbnail: nationalTrustImg,
    videoUrl: '',
    quote: 'Our B.Ed degree is virtually a visa to go abroad. 75% to 80% of our graduates are placed across the United States and top institutions worldwide.',
    description: 'The faculty leadership describe the rigorous 80% mandatory attendance, daily hands-on classroom training, and Osmania University gold medals that distinguish Swayamkrushi educators globally.'
  },
  {
    id: 'g-aruna',
    name: 'G Aruna',
    role: 'Campus Gardener to Certified Special Educator',
    category: 'Educators & Staff',
    tag: 'TRANSFORMATION STORY',
    orgBadge: 'STAFF STORY',
    duration: '2:20',
    thumbnail: grouphomeResidents,
    videoUrl: '',
    quote: 'I joined in 2020 as a humble campus gardener to feed my child. Today, thanks to full sponsorship and training from Swayamkrushi, I am a proud certified teacher.',
    description: 'Aruna shares her deeply inspiring journey overcoming extreme poverty as a single mother to earning her special education credentials and shaping young minds.'
  },
  {
    id: 'bharati-saini',
    name: 'Bharati Saini',
    role: 'Fine Artist & Art Educator from Uttarakhand',
    category: 'Therapists',
    tag: 'CREATIVE ARTS',
    orgBadge: 'ART STUDIO',
    duration: '2:46',
    thumbnail: birthdayCourtyard,
    videoUrl: '',
    quote: 'Art is the great equalizer. Painting with my elbow stumps, I see my 25 students open their hearts and express their purest imagination without fear.',
    description: 'Bharati demonstrates how art therapy transcends verbal barriers, enabling trainees with intellectual disabilities to create radiant canvases and craft pieces.'
  },
  {
    id: 'j-srilata',
    name: 'J Srilata',
    role: 'Former School Ayah to Special Educator',
    category: 'Educators & Staff',
    tag: 'MENTORSHIP & GRIT',
    orgBadge: 'STAFF STORY',
    duration: '2:32',
    thumbnail: circleIncluded,
    videoUrl: '',
    quote: 'These children shower you with unconditional love every single day. Swayamkrushi showed me that compassion and perseverance can conquer any life challenge.',
    description: 'Hailing from an agricultural family in Siddipet, Srilata explains how mentorship and determination transformed her from an attendant to an inspiring classroom leader.'
  },
  {
    id: 'group-home-care',
    name: 'Group Home Caregivers & Residents',
    role: 'Residential Independent Living Program',
    category: 'Parents & Families',
    tag: 'INDEPENDENT LIVING',
    orgBadge: 'GROUP HOMES',
    duration: '3:02',
    thumbnail: circleLeft,
    videoUrl: '',
    quote: 'Living in small family clusters of eight, our girls learn to cook, commute, manage money, and build real friendships within the neighborhood community.',
    description: 'A close-up look into Swayamkrushi’s five pioneering Group Homes where adult women with intellectual challenges achieve true self-reliance.'
  }
]

const CATEGORIES = [
  'All Voices',
  'Educators & Staff',
  'Therapists',
  'Alumni & Trainees',
  'Parents & Families'
]

export default function InsidersPage() {
  const [insiders, setInsiders] = useState(INITIAL_INSIDERS)
  const [selectedCategory, setSelectedCategory] = useState('All Voices')
  const [activeVideo, setActiveVideo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch dynamic videos from backend API
  useEffect(() => {
    fetchInsiders().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const enriched = data.map((item) => ({
          ...item,
          thumbnail: item.thumbnail || LOCAL_THUMBNAILS[item.id] || manjulaPortrait
        }))
        setInsiders(enriched)
      }
    })
  }, [])

  // Filter items
  const filteredData = selectedCategory === 'All Voices'
    ? insiders
    : insiders.filter((item) => item.category === selectedCategory)

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeVideo) return
      if (e.key === 'Escape') {
        setActiveVideo(null)
        setIsPlaying(false)
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeVideo, insiders])

  const openVideo = (item) => {
    setActiveVideo(item)
    setIsPlaying(true)
  }

  const closeVideo = () => {
    setActiveVideo(null)
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (!activeVideo || insiders.length === 0) return
    const currentIndex = insiders.findIndex((v) => v.id === activeVideo.id)
    const nextIndex = (currentIndex + 1) % insiders.length
    setActiveVideo(insiders[nextIndex])
    setIsPlaying(true)
  }

  const handlePrev = () => {
    if (!activeVideo || insiders.length === 0) return
    const currentIndex = insiders.findIndex((v) => v.id === activeVideo.id)
    const prevIndex = (currentIndex - 1 + insiders.length) % insiders.length
    setActiveVideo(insiders[prevIndex])
    setIsPlaying(true)
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <main className="insiders-page-wrap">
      <SEO
        title="Swayamkrushi Insiders | Vocal Video Stories & Perspectives"
        description="Watch inspiring video stories and interviews from special educators, speech therapists, alumni, parents, and residents at Swayamkrushi."
        keywords="Swayamkrushi videos, special educator interviews, disability success stories, group home testimonials, Hyderabad NGO stories"
        canonicalUrl="https://swayamkrushi.org/#/insiders"
      />

      {/* Hero Header */}
      <header className="insiders-hero-header">
        <div className="insiders-tag-badge">
          <span className="insiders-tag-dot" />
          <span>Vocal Video & Insider Perspectives</span>
        </div>
        <h1 className="insiders-main-title">Swayamkrushi Insiders</h1>
        <p className="insiders-subtitle">
          Watch educators, therapists, alumni, caregivers, and families share how Swayamkrushi empowers persons with intellectual disabilities toward self-reliance, dignity, and lifelong purpose.
        </p>

        {/* Category Filter Tabs */}
        <div className="insiders-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`insiders-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Video Cards Grid - Matches 3x2 Vocal Video Testimonial Wall */}
      <section className="insiders-video-grid" aria-label="Video Testimonials Grid">
        {filteredData.map((item) => {
          const thumb = item.thumbnail || LOCAL_THUMBNAILS[item.id] || manjulaPortrait

          return (
            <article
              key={item.id}
              className="insider-video-card"
              onClick={() => openVideo(item)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openVideo(item)
                }
              }}
            >
              {/* Background Thumbnail Image */}
              <img
                src={thumb}
                alt={item.name}
                className="insider-card-bg"
                loading="lazy"
                onError={(e) => {
                  const fallback = LOCAL_THUMBNAILS[item.id] || manjulaPortrait
                  if (e.target.src !== fallback) e.target.src = fallback
                }}
              />

              {/* Dark Bottom Gradient Overlay */}
              <div className="insider-card-overlay" />

              {/* Top Bar Badges */}
              <div className="insider-card-top">
                <span className="insider-badge-pill">{item.orgBadge || 'SWAYAMKRUSHI'}</span>
                <span className="insider-duration-tag">{item.duration || '2:30'}</span>
              </div>

              {/* Center Play Button with Burgundy Theme */}
              <div className="insider-play-btn-wrap">
                <div className="insider-play-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>

              {/* Bottom Content Area */}
              <div className="insider-card-bottom">
                <div className="insider-story-tag">
                  <span className="insider-story-bar" />
                  <span>{item.tag || 'INSIDER STORY'}</span>
                </div>
                <h3 className="insider-speaker-name">{item.name}</h3>
                <p className="insider-speaker-role">{item.role}</p>
              </div>
            </article>
          )
        })}
      </section>

      {/* Interactive Modal Video Player */}
      {activeVideo && (
        <div
          className="insiders-modal-backdrop"
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="insiders-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="insiders-modal-close"
              onClick={closeVideo}
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* High-End Video & Media Player Stage */}
            <div className="insiders-modal-player-wrapper">
              <VideoPlayer
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnail || LOCAL_THUMBNAILS[activeVideo.id] || manjulaPortrait}
                title={activeVideo.name}
                subtitle={activeVideo.role}
                category={activeVideo.category}
                tag={activeVideo.tag}
                durationText={activeVideo.duration || '2:30'}
                quote={activeVideo.quote}
                autoPlay={true}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </div>

            {/* Modal Info Body */}
            <div className="insiders-modal-info">
              <div className="insiders-modal-header-row">
                <div>
                  <h2 className="insiders-modal-speaker-name">{activeVideo.name}</h2>
                  <p className="insiders-modal-speaker-role">{activeVideo.role}</p>
                </div>
                <span className="insiders-modal-badge">{activeVideo.category}</span>
              </div>

              {/* Featured Quote */}
              {activeVideo.quote && (
                <blockquote className="insiders-modal-quote">
                  “{activeVideo.quote}”
                </blockquote>
              )}

              {activeVideo.description && (
                <p className="insiders-modal-desc">
                  {activeVideo.description}
                </p>
              )}

              {/* Navigation and Share Footer */}
              <div className="insiders-modal-nav-footer">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="insiders-nav-pill-btn"
                    onClick={handlePrev}
                  >
                    ← Previous Story
                  </button>
                  <button
                    type="button"
                    className="insiders-nav-pill-btn"
                    onClick={handleNext}
                  >
                    Next Story →
                  </button>
                </div>

                <button
                  type="button"
                  className="insiders-share-pill-btn"
                  onClick={handleShare}
                >
                  {copied ? 'Link Copied! ✓' : 'Share Story ↗'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
