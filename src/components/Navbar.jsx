import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

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
          <li className={`has-sub ${openDropdown === 'about' ? 'is-open' : ''}`}>
            <a
              href="#about"
              onClick={(e) => {
                if (window.innerWidth <= 900) {
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
                <a href="#about" onClick={(e) => { e.preventDefault(); handleNavAnchor('about'); }}>Our story</a>
              </li>
              <li>
                <Link to="/committee" onClick={() => setMobileMenuOpen(false)}>Managing committee</Link>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleNavAnchor('about'); }}>Annual reports</a>
              </li>
            </ul>
          </li>
          <li className={`has-sub ${openDropdown === 'fun-facts' ? 'is-open' : ''}`}>
            <a
              href="#stories"
              onClick={(e) => {
                if (window.innerWidth <= 900) {
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
              <li>
                <Link to="/article/story-thinking" onClick={() => setMobileMenuOpen(false)}>Thinking out of the box!</Link>
              </li>
              <li>
                <Link to="/article/story-visa" onClick={() => setMobileMenuOpen(false)}>Visa to go abroad</Link>
              </li>
              <li>
                <Link to="/article/story-sai-baba" onClick={() => setMobileMenuOpen(false)}>The mysterious appearance of Shirdi Sai Baba</Link>
              </li>
            </ul>
          </li>
          <li className={`has-sub ${openDropdown === 'success-stories' ? 'is-open' : ''}`}>
            <a
              href="#success-stories"
              onClick={(e) => {
                if (window.innerWidth <= 900) {
                  e.preventDefault()
                  toggleDropdown('success-stories')
                } else {
                  e.preventDefault()
                  handleNavAnchor('success-stories')
                }
              }}
            >
              Success stories
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
                <Link to="/article/story-champions" onClick={() => setMobileMenuOpen(false)}>
                  Champions All the Way
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link to="/article/story-encounter" onClick={() => setMobileMenuOpen(false)}>Manjula's Musings</Link>
          </li>
          <li>
            <Link to="/accolades" onClick={() => setMobileMenuOpen(false)}>Accolades</Link>
          </li>
          <li>
            <Link to="/media-buzz" onClick={() => setMobileMenuOpen(false)}>Media buzz</Link>
          </li>
          <li>
            <Link to="/insiders" onClick={() => setMobileMenuOpen(false)}>Insiders</Link>
          </li>
          <li>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
