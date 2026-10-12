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
        a.id !== 'story-kitchen' &&
        a.id !== 'story-encounter' &&
        a.id !== 'story-group-homes-initiative' &&
        a.id !== 'story-womens-empowerment' &&
        a.id !== 'story-direct-speak' &&
        a.id !== 'story-recipe-success' &&
        a.id !== 'story-luck-hardwork' &&
        !a.title?.toLowerCase().includes('kitchen') &&
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

  const closeAllMenus = () => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur()
    }
  }

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Automatically close any open menus and blur focus on route or hash changes
  useEffect(() => {
    closeAllMenus()
  }, [location.pathname, location.hash])

  // Clear open dropdown state when transitioning to desktop screen sizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setMobileMenuOpen(false)
        setOpenDropdown(null)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleNavAnchor = (targetId) => {
    closeAllMenus()
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

  const isHome = location.pathname === '/' || location.pathname === ''

  return (
    <nav className={`sitebar ${isHome ? 'sitebar-home' : 'sitebar-inner-page'}`} aria-label="Main Navigation">
      <div className="sitebar-inner">
        {!isHome && (
          <Link
            to="/"
            className="mobile-brand"
            onClick={() => {
              closeAllMenus()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Swayamkrushi
          </Link>
        )}

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
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
                closeAllMenus()
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
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="nav-home-text">Home</span>
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
                <Link to="/article/dare-to-dream" onClick={closeAllMenus}>Dare to Dream</Link>
              </li>
              <li>
                <Link to="/committee" onClick={closeAllMenus}>Who's Who</Link>
              </li>
              <li>
                <Link to="/insiders" onClick={closeAllMenus}>Insiders' views</Link>
              </li>
              <li>
                <Link to="/annual-reports" onClick={closeAllMenus}>Annual reports</Link>
              </li>
              <li>
                <Link to="/faq" onClick={closeAllMenus}>FAQ</Link>
              </li>
              <li>
                <Link to="/contact" onClick={closeAllMenus}>Contact</Link>
              </li>
            </ul>
          </li>
          <li className={`has-sub ${openDropdown === 'building-blocks' ? 'is-open' : ''}`}>
            <a
              href="#building-blocks"
              onClick={(e) => {
                if (window.innerWidth <= 992) {
                  e.preventDefault()
                  toggleDropdown('building-blocks')
                } else {
                  e.preventDefault()
                  handleNavAnchor('building-blocks')
                }
              }}
            >
              Building Blocks
            </a>
            <ul className="submenu">
              <li>
                <Link to="/article/building-blocks" onClick={closeAllMenus}>
                  Blood, Sweat and Tears
                </Link>
              </li>
              <li>
                <Link to="/article/home-of-care" onClick={closeAllMenus}>
                  A Home of Care, Growth and Hope
                </Link>
              </li>
              <li>
                <Link to="/article/group-homes" onClick={closeAllMenus}>
                  Group Home — A Pioneering Initiative Ahead of Time
                </Link>
              </li>
              <li>
                <Link to="/article/bed-hotspot" onClick={closeAllMenus}>
                  Swayamkrushi — The B.Ed Hotspot
                </Link>
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
                <Link to="/article/story-encounter" onClick={closeAllMenus}>
                  Chance Encounter That Changed My Life
                </Link>
              </li>
              <li>
                <Link to="/article/story-group-homes-initiative" onClick={closeAllMenus}>
                  Group Homes – Pioneering initiative that catapulted Swayamkrushi into higher orbit
                </Link>
              </li>
              <li>
                <Link to="/article/story-womens-empowerment" onClick={closeAllMenus}>
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
                <Link to="/article/story-fifteen-years" onClick={closeAllMenus}>
                  15 Years for One Word, and Then the Exhilaration!
                </Link>
              </li>
              <li>
                <Link to="/article/story-art-equaliser" onClick={closeAllMenus}>
                  Art — The Great Equaliser
                </Link>
              </li>
              <li>
                <Link to="/article/story-nios" onClick={closeAllMenus}>
                  NIOS — Boon for Persons with Intellectual Disabilities
                </Link>
              </li>
              <li>
                <Link to="/article/story-paper-bag" onClick={closeAllMenus}>
                  Paper Bag Making — It's a 'Mild' Job
                </Link>
              </li>
              <li>
                <Link to="/article/story-exercise" onClick={closeAllMenus}>
                  Exercise of a Different Kind
                </Link>
              </li>
              <li>
                <Link to="/article/story-therapy-body-soul-mind" onClick={closeAllMenus}>
                  Therapy for body, soul and mind
                </Link>
              </li>
              <li>
                <Link to="/article/story-sowing-seeds" onClick={closeAllMenus}>
                  Sowing Seeds of Creativity
                </Link>
              </li>
              <li>
                <Link to="/article/story-kitchen" onClick={closeAllMenus}>
                  Kitchen — Beehive of Activity
                </Link>
              </li>
              <li>
                <Link to="/article/story-covid" onClick={closeAllMenus}>
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
                    onClick={closeAllMenus}
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
                <Link to="/article/story-hard-work" onClick={closeAllMenus}>
                  Hard Work Never Goes Unrewarded!
                </Link>
              </li>
              <li>
                <Link to="/article/story-luck-hardwork" onClick={closeAllMenus}>
                  Luck, Hard Work and Guardian Angel Spell Success
                </Link>
              </li>
              <li>
                <Link to="/article/story-recipe-success" onClick={closeAllMenus}>
                  Recipe for Success
                </Link>
              </li>
              <li>
                <Link to="/article/story-champions" onClick={closeAllMenus}>
                  Champions All the Way
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link to="/accolades" onClick={closeAllMenus}>Accolades</Link>
          </li>
          <li>
            <Link to="/media-buzz" onClick={closeAllMenus}>Media buzz</Link>
          </li>
          <li>
            <Link to="/events" onClick={closeAllMenus}>Events</Link>
          </li>
        </ul>

        {/* Backdrop for side drawer on mobile */}
        {mobileMenuOpen && (
          <div
            className="sitebar-backdrop"
            onClick={closeAllMenus}
            aria-hidden="true"
          />
        )}
      </div>
    </nav>
  )
}
