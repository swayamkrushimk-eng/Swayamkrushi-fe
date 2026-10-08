import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchFaqs, fetchSettings } from '../services/api'
import SEO from '../components/SEO'
import './FaqPage.css'

export const defaultFaqItems = [
  {
    id: 'faq-enrollment',
    question: 'How do I enroll my child at Swayamkrushi?',
    answer: 'Contact us by phone or email to arrange an initial visit and assessment. Our team will guide you through the admission process and available programmes.',
    category: 'Admissions & Care'
  },
  {
    id: 'faq-age-groups',
    question: 'What age groups do you serve?',
    answer: 'We serve children from school age through adulthood. Our programmes are tailored to the individual\'s developmental stage, not strictly by age.',
    category: 'Admissions & Care'
  },
  {
    id: 'faq-residential',
    question: 'Are there residential facilities?',
    answer: 'Yes, we offer 24/7 residential care with full supervision, meals, healthcare support, and participation in all programmes.',
    category: 'Residential & Support'
  },
  {
    id: 'faq-volunteer',
    question: 'Can I volunteer at Swayamkrushi?',
    answer: 'Absolutely. We welcome volunteers with skills in education, therapy, arts, administration, and more. Fill the contact form and select "Volunteer" to get started.',
    category: 'Volunteering & Community'
  },
  {
    id: 'faq-donations',
    question: 'How are donations used?',
    answer: 'A minimum of 80 per cent of every donation goes directly to programmes and care. Full details are published in our Annual Reports.',
    category: 'Donations & Governance'
  },
  {
    id: 'faq-bed-recognition',
    question: 'Is the B.Ed programme government recognised?',
    answer: 'Yes, the B.Ed Special Education programme is affiliated with Osmania University and certified by the Rehabilitation Council of India (RCI).',
    category: 'Academics & Degrees'
  }
]

export default function FaqPage() {
  const [items, setItems] = useState(defaultFaqItems)
  const [openItems, setOpenItems] = useState({
    'faq-enrollment': true,
    'faq-age-groups': true,
    'faq-residential': true,
    'faq-volunteer': true,
    'faq-donations': true,
    'faq-bed-recognition': true
  })
  const [siteSettings, setSiteSettings] = useState({
    phone1: '+91 9704245454',
    phone2: '+91 9963766729',
    email: 'swayamkrushimk@gmail.com'
  })
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchFaqs().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setItems(data)
        const initialOpens = {}
        data.forEach((d) => {
          initialOpens[d.id || d._id] = true
        })
        setOpenItems(initialOpens)
      }
    })

    fetchSettings().then((data) => {
      if (data) setSiteSettings(data)
    })
  }, [])

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleExpandAll = () => {
    const allOpen = {}
    items.forEach((item) => {
      allOpen[item.id] = true
    })
    setOpenItems(allOpen)
  }

  const handleCollapseAll = () => {
    setOpenItems({})
  }

  const areAllOpen = items.every((item) => openItems[item.id])

  const handleContactAnchor = (e) => {
    e.preventDefault()
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById('contact')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 120)
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': items.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  }

  return (
    <main className="faq-page-wrap">
      <SEO
        title="Frequently Asked Questions (FAQ) | Admissions, Care & Degrees"
        description="Comprehensive answers to common questions about admissions, group homes, volunteer work, donations, speech therapy, and B.Ed Special Education at Swayamkrushi."
        keywords="Swayamkrushi FAQ, special school admissions Hyderabad, intellectual disability group homes, volunteer NGO Telangana, B.Ed special education admission"
        canonicalUrl="https://swayamkrushi.org/#/faq"
        schema={faqSchema}
      />

      {/* Hero Header */}
      <header className="faq-hero-header">
        <div className="faq-badge">
          <span className="faq-badge-dot" />
          <span>GUIDANCE &amp; INFORMATION</span>
        </div>
        <h1 className="faq-main-headline">Frequently asked Questions</h1>
        <p className="faq-intro-lead">
          Find clear answers regarding admissions, developmental care, group homes, volunteer opportunities, donor transparency, and our recognized academic programmes.
        </p>
      </header>

      {/* FAQ Accordion List */}
      <section className="faq-list" aria-label="Frequently Asked Questions List">
        {items.map((item, index) => {
          const isOpen = !!openItems[item.id]
          const displayNumber = String(index + 1).padStart(2, '0')

          return (
            <article
              key={item.id}
              className={`faq-item-card ${isOpen ? 'is-open' : ''}`}
            >
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`answer-${item.id}`}
              >
                <div className="faq-question-header-content">
                  <span className="faq-index-number">{displayNumber}</span>
                  <div className="faq-title-wrap">
                    <h2 className="faq-question-title">{item.question}</h2>
                  </div>
                </div>

                <div className="faq-indicator" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div
                  id={`answer-${item.id}`}
                  className="faq-answer-collapse"
                  role="region"
                >
                  <p className="faq-answer-text">{item.answer}</p>
                </div>
              )}
            </article>
          )
        })}
      </section>

      {/* Bottom Contact / Guidance Callout */}
      <section className="faq-contact-card" aria-label="Still Have Questions Support">
        <div className="faq-contact-info">
          <h3>Need personalised assistance or looking to visit?</h3>
          <p>
            Our dedicated team is always happy to discuss individual requirements, schedule assessments, or arrange an in-person tour of our Secunderabad and Jawahar Nagar campuses.
          </p>
        </div>

        <div className="faq-contact-actions">
          <a
            href="#contact"
            onClick={handleContactAnchor}
            className="faq-contact-btn"
          >
            Contact Us Today →
          </a>
          <div className="faq-contact-details">
            <span>
              <strong>Phone:</strong>{' '}
              {siteSettings.phone1 && (
                <a href={`tel:${siteSettings.phone1.replace(/\s+/g, '')}`}>
                  {siteSettings.phone1}
                </a>
              )}
              {siteSettings.phone2 && (
                <>
                  {' '}·{' '}
                  <a href={`tel:${siteSettings.phone2.replace(/\s+/g, '')}`}>
                    {siteSettings.phone2}
                  </a>
                </>
              )}
            </span>
            <span>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${siteSettings.email || 'swayamkrushimk@gmail.com'}`}>
                {siteSettings.email || 'swayamkrushimk@gmail.com'}
              </a>
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
