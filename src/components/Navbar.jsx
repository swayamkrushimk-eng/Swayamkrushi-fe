import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { leftSideArticles } from '../data/articlesData'
import { fetchArticles } from '../services/api'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const filterFunFacts = (list) => {
    if (!Array.isArray(list)) return []
    return list.filter(
      (a) =>
        a.id !== 'story-encounter' &&
        a.id !== 'story-group-homes-initiative' &&
        a.id !== 'story-womens-empowerment' &&
        a.id !== 'story-direct-speak' &&
        a.id !== 'story-recipe-success' &&
        a.id !== 'story-luck-hardwork' &&
        !a.title?.toLowerCase().includes('chance encounter') &&
        !a.title?.toLowerCase().includes('direct speak')
    )
  }

  const [funFacts, setFunFacts] = useState(() => filterFunFacts(leftSideArticles))

  useEffect(() => {
    fetchArticles({ section: 'left' }).then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setFunFacts(filterFunFacts(data))
      }
    })
  }, [])

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleNavAnchor = (targetId) => {
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(targetId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(targetId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="sitebar" aria-label="Main Navigation">
      <div className="sitebar-inner">
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`sitemenu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li className="nav-home-item">
            <Link
              to="/"
              className="nav-home-icon-link"
              onClick={() => {
                setMobileMenuOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              title="Home"
              aria-label="Home"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
          </li>
          <li className={`has-sub ${openDropdown === 'about' ? 'is-open' : ''}`}>
            <a
              href="#about"
              onClick={(e) => {
                if (window.innerWidth <= 992) {
                  e.preventDefault()
                  toggleDropdown('about')
                } else {
                  e.preventDefault()
                  handleNavAnchor('about')
                }
              }}
            >
              About
            </a>
            <ul className="submenu">
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleNavAnchor('about'); }}>Dare to Dream</a>
              </li>
              <li>
                <Link to="/committee" onClick={() => setMobileMenuOpen(false)}>Who's Who</Link>
              </li>
              <li>
                <Link to="/insiders" onClick={() => setMobileMenuOpen(false)}>Insiders views</Link>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleNavAnchor('about'); }}>Annual reports</a>
              </li>
              <li>
                <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </li>
            </ul>
          </li>
          <li className={`has-sub ${openDropdown === 'manjula-musings' ? 'is-open' : ''}`}>
            <a
              href="#manjula-musings"
              onClick={(e) => {
                if (window.innerWidth <= 992) {
                  e.preventDefault()
                  toggleDropdown('manjula-musings')
                } else {
                  e.preventDefault()
                  handleNavAnchor('manjula-musings')
                }
              }}
            >
              Manjula's Musings
            </a>
            <ul className="submenu">
              <li>
                <Link to="/article/story-encounter" onClick={() => setMobileMenuOpen(false)}>
                  Chance Encounter That Changed My Life
                </Link>
              </li>
              <li>
                <Link to="/article/story-group-homes-initiative" onClick={() => setMobileMenuOpen(false)}>
                  Group Homes – Pioneering initiative that catapulted Swayamkrushi into higher orbit
                </Link>
              </li>
              <li>
                <Link to="/article/story-womens-empowerment" onClick={() => setMobileMenuOpen(false)}>
                  Women’s empowerment - A byproduct of Swayamkrushi
                </Link>
              </li>
            </ul>
          </li>
          <li className={`has-sub ${openDropdown === 'activities-galore' ? 'is-open' : ''}`}>
            <a
              href="#activities-galore"
              onClick={(e) => {
                if (window.innerWidth <= 992) {
                  e.preventDefault()
                  toggleDropdown('activities-galore')
                } else {
                  e.preventDefault()
                  handleNavAnchor('activities-galore')
                }
              }}
            >
              Activities galore
            </a>
            <ul className="submenu">
              <li>
                <Link to="/article/story-fifteen-years" onClick={() => setMobileMenuOpen(false)}>
                  15 Years for One Word, and Then the Exhilaration!
                </Link>
              </li>
              <li>
                <Link to="/article/story-art-equaliser" onClick={() => setMobileMenuOpen(false)}>
                  Art — The Great Equaliser
                </Link>
              </li>
              <li>
                <Link to="/article/story-nios" onClick={() => setMobileMenuOpen(false)}>
                  NIOS — Boon for Persons with Intellectual Disabilities
                </Link>
              </li>
              <li>
                <Link to="/article/story-paper-bag" onClick={() => setMobileMenuOpen(false)}>
                  Paper Bag Making — It's a 'Mild' Job
                </Link>
              </li>
              <li>
                <Link to="/article/story-exercise" onClick={() => setMobileMenuOpen(false)}>
                  Exercise of a Different Kind
                </Link>
              </li>
              <li>
                <Link to="/article/story-sowing-seeds" onClick={() => setMobileMenuOpen(false)}>
                  Sowing Seeds of Creativity
                </Link>
              </li>
              <li>
                <Link to="/article/story-kitchen" onClick={() => setMobileMenuOpen(false)}>
                  Kitchen — Beehive of Activity
                </Link>
              </li>
              <li>
                <Link to="/article/story-covid" onClick={() => setMobileMenuOpen(false)}>
                  The Covid Years — Opportunities to Serve
                </Link>
              </li>
            </ul>
          </li>
          <li className={`has-sub ${openDropdown === 'fun-facts' ? 'is-open' : ''}`}>
            <a
              href="#stories"
              onClick={(e) => {
                if (window.innerWidth <= 992) {
                  e.preventDefault()
                  toggleDropdown('fun-facts')
                } else {
                  e.preventDefault()
                  handleNavAnchor('stories')
                }
              }}
            >
              Fun facts
            </a>
            <ul className="submenu">
              {funFacts.map((article) => (
                <li key={article.id}>
                  <Link
                    to={`/article/${article.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className={`has-sub ${openDropdown === 'success-stories' ? 'is-open' : ''}`}>
            <a
              href="#success-stories"
              onClick={(e) => {
                if (window.innerWidth <= 992) {
                  e.preventDefault()
                  toggleDropdown('success-stories')
                } else {
                  e.preventDefault()
                  handleNavAnchor('success-stories')
                }
              }}
            >
              Winning hearts
            </a>
            <ul className="submenu">
              <li>
                <Link to="/article/story-hard-work" onClick={() => setMobileMenuOpen(false)}>
                  Hard Work Never Goes Unrewarded!
                </Link>
              </li>
              <li>
                <Link to="/article/story-luck-hardwork" onClick={() => setMobileMenuOpen(false)}>
                  Luck, Hard Work and Guardian Angel Spell Success
                </Link>
              </li>
              <li>
                <Link to="/article/story-recipe-success" onClick={() => setMobileMenuOpen(false)}>
                  Recipe for Success
                </Link>
              </li>
              <li>
                <Link to="/article/story-champions" onClick={() => setMobileMenuOpen(false)}>
                  Champions All the Way
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link to="/accolades" onClick={() => setMobileMenuOpen(false)}>Accolades</Link>
          </li>
          <li>
            <Link to="/media-buzz" onClick={() => setMobileMenuOpen(false)}>Media buzz</Link>
          </li>
          <li>
            <Link to="/events" onClick={() => setMobileMenuOpen(false)}>Events</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
