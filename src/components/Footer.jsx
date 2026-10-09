import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fetchSettings } from '../services/api'
import logoImg from '../assets/images/logo.png'

export default function Footer() {
  const location = useLocation()
  const navigate = useNavigate()

  const [settings, setSettings] = useState({
    orgName: 'Swayamkrushi',
    address: 'Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal, Secunderabad, Telangana.',
    visitingHours: 'Open 10am to 4pm, Monday to Saturday.',
    phone1: '+91 9100106454',
    phone2: '',
    email: 'swayamkrushimk@gmail.com',
    regNo: 'Reg. No. 3608/1991'
  })

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            address: data.address || prev.address,
            phone1: data.phone1 || prev.phone1,
            phone2: data.phone2 || prev.phone2,
            email: data.email || prev.email,
            visitingHours: data.visitingHours || prev.visitingHours
          }))
        }
      })
      .catch(() => {})
  }, [])

  const handleNavAnchor = (targetId) => {
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

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* ─── COMPREHENSIVE BROADSHEET FOOTER (CONTACT & INFO) ──────── */}
      <footer className="footer-main-container" id="contact" aria-label="Footer and Contact details">
        <div className="footer-main-inner">
          
          {/* Column 1: Organization & Identity */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-header">
              <img src={logoImg} alt="Swayamkrushi Logo" className="footer-brand-logo" />
              <div className="footer-brand-titles">
                <h4 className="footer-brand-name">Swayamkrushi</h4>
                <span className="footer-brand-reg">REG. NO. 3608/1991</span>
              </div>
            </div>
            <p className="footer-brand-tagline">
              Self reliance for persons with intellectual disabilities, since 1991.
            </p>
            <p className="footer-brand-mission">
              Dedicated to providing lifelong residential care, functional academics, vocational empowerment, and dignity for individuals with special needs.
            </p>
          </div>

          {/* Column 2: Visit Us */}
          <div className="footer-col footer-col-visit">
            <h4 className="footer-col-heading">Visit</h4>
            <div className="footer-address-box">
              <p className="footer-address-text">
                {settings.address}
              </p>
              <div className="footer-hours-pill">
                <span className="footer-hours-icon">🕒</span>
                <span>{settings.visitingHours}</span>
              </div>
              <p className="footer-visit-note">
                Visitors, parents, and volunteers are warmly welcomed with prior appointment.
              </p>
            </div>
          </div>

          {/* Column 3: Reach Us (Phone & Email) */}
          <div className="footer-col footer-col-reach">
            <h4 className="footer-col-heading">Reach us</h4>
            <div className="footer-reach-box">
              <div className="footer-reach-item">
                <span className="footer-reach-label">Direct Phone Lines</span>
                <div className="footer-phones-list">
                  <a
                    href={`tel:${(settings.phone1 && !settings.phone1.includes('XXXXXXXXXX') && !settings.phone1.includes('9704245454') ? settings.phone1 : '+91 9100106454').replace(/\s+/g, '')}`}
                    className="footer-contact-link footer-phone-link"
                    title="Direct Phone Line: +91 9100106454"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {settings.phone1 && !settings.phone1.includes('XXXXXXXXXX') && !settings.phone1.includes('9704245454') ? settings.phone1 : '+91 9100106454'}
                  </a>
                </div>
              </div>

              <div className="footer-reach-item">
                <span className="footer-reach-label">Official Inquiries & Email</span>
                <a
                  href={`mailto:${settings.email}`}
                  className="footer-contact-link footer-email-link"
                  title={`Email ${settings.email}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {settings.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Directory */}
          <div className="footer-col footer-col-links">
            <h4 className="footer-col-heading">Explore</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleNavAnchor('about'); }}>
                  About Swayamkrushi
                </a>
              </li>
              <li>
                <Link to="/donation" className="footer-give-highlight">
                  Donation →
                </Link>
              </li>
              <li>
                <Link to="/insiders">
                  Insider's Views
                </Link>
              </li>
              <li>
                <Link to="/events">
                  Events Gallery
                </Link>
              </li>
              <li>
                <Link to="/committee">
                  Who's Who
                </Link>
              </li>
              <li>
                <Link to="/accolades">
                  Accolades & Recognition
                </Link>
              </li>
              <li>
                <Link to="/media-buzz">
                  Media Buzz
                </Link>
              </li>
              <li>
                <Link to="/faq">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ─── COLOPHON BOTTOM BAR ─────────────────────────────────── */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-inner">
            <div className="footer-copyright">
              © 2026 Swayamkrushi · Reg. No. 3608/1991 · All Rights Reserved
            </div>
            <div className="footer-bottom-nav">
              <a href="#about" onClick={(e) => { e.preventDefault(); handleNavAnchor('about'); }}>About</a>
              <span>·</span>
              <Link to="/donation">Donation</Link>
              <span>·</span>
              <Link to="/insiders">Insider's views</Link>
              <span>·</span>
              <Link to="/contact">Contact</Link>
              <span>·</span>
              <button onClick={handleScrollTop} className="footer-top-btn" title="Back to top">
                Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

