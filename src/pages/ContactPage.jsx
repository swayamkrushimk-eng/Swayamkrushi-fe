import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchSettings } from '../services/api'
import SEO from '../components/SEO'
import './ContactPage.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.swayamkrushi.org/api'

const INQUIRY_TYPES = [
  { value: 'inquiry',    label: 'General Inquiry' },
  { value: 'admission',  label: 'Admission / Enrolment' },
  { value: 'volunteer',  label: 'Volunteer with Us' },
  { value: 'donation',   label: 'Donation / Sponsorship' },
  { value: 'media',      label: 'Media / Press' },
  { value: 'other',      label: 'Other' }
]

export default function ContactPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    phone1: '+91 9704245454',
    phone2: '+91 9963766729',
    email: 'swayamkrushimk@gmail.com',
    address: 'Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal, Secunderabad, Telangana.',
    visitingHours: 'Mon – Sat: 10 am – 4 pm'
  })
  const [form, setForm] = useState({
    name: '', email: '', phone: '', type: 'inquiry', subject: '', message: ''
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchSettings().then(d => { if (d) setSettings(s => ({ ...s, ...d })) })
    window.scrollTo({ top: 0 })
  }, [])

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Please fill in your name, email, and message.')
      return
    }
    setErrorMsg('')
    setStatus('sending')
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          type: form.type,
          subject: form.subject.trim() || `${form.type.toUpperCase()}: Message from ${form.name.trim()}`,
          message: form.message.trim()
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setStatus('success')
      setForm({ name: '', email: '', phone: '', type: 'inquiry', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact Swayamkrushi NGO',
    'description': 'Get in touch with Swayamkrushi regarding admissions, group homes, volunteering, donations, and teacher training.',
    'url': 'https://swayamkrushi.org/#/contact',
    'mainEntity': {
      '@type': 'NGO',
      'name': 'Swayamkrushi',
      'telephone': settings.phone1 || '+91-9704245454',
      'email': settings.email || 'swayamkrushimk@gmail.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': settings.address || 'Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal',
        'addressLocality': 'Secunderabad',
        'addressRegion': 'Telangana',
        'postalCode': '500087',
        'addressCountry': 'IN'
      }
    }
  }

  return (
    <div className="contact-page-wrap">
      <SEO
        title="Contact Us | Admissions, Visits, Volunteering & Support"
        description="Reach out to Swayamkrushi NGO in Secunderabad, Telangana. Connect with our team for student admissions, group homes visits, volunteer opportunities, and donations."
        keywords="Contact Swayamkrushi, Swayamkrushi address, NGO phone number Secunderabad, special school contact Telangana"
        canonicalUrl="https://swayamkrushi.org/#/contact"
        schema={contactSchema}
      />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <header className="contact-page-header">
        <h1 className="contact-page-title">We'd Love to Hear From You</h1>
        <p className="contact-page-sub">
          Whether you're a parent, volunteer, donor, researcher, or just curious —
          reach out. Every message is read personally by our team.
        </p>
      </header>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div className="contact-main-grid">

        {/* Left — Info Cards */}
        <aside className="contact-info-col">

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="contact-info-text">
              <h3>Phone</h3>
              <a href={`tel:${(settings.phone1 || '').replace(/\s+/g, '')}`}>{settings.phone1}</a>
              {settings.phone2 && (
                <a href={`tel:${settings.phone2.replace(/\s+/g, '')}`}>{settings.phone2}</a>
              )}
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="contact-info-text">
              <h3>Email</h3>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="contact-info-text">
              <h3>Address</h3>
              <p>{settings.address}</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="contact-info-text">
              <h3>Visiting Hours</h3>
              <p>{settings.visitingHours || 'Mon – Sat: 10 am – 4 pm'}</p>
              <span className="contact-info-note">Prior appointment preferred.</span>
            </div>
          </div>

          {/* Divider rule */}
          <div className="contact-info-divider" aria-hidden="true" />

          {/* Map embed */}
          <div className="contact-map-wrap">
            <h3 className="contact-map-label">Find Us</h3>
            <div className="contact-map-frame">
              <iframe
                title="Swayamkrushi Location"
                src="https://www.google.com/maps?q=Swayamkrushi+NGO,+Jawaharnagar+Village,+Chennapur,+Shamirpet,+Secunderabad,+Telangana&output=embed"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              className="contact-map-open"
              href="https://maps.google.com/?q=Swayamkrushi+NGO,+Jawaharnagar+Village,+Chennapur,+Shamirpet,+Secunderabad,+Telangana"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps →
            </a>
          </div>
        </aside>

        {/* Right — Contact Form */}
        <section className="contact-form-col" aria-label="Contact form">
          <div className="contact-form-card">
            <h2 className="contact-form-heading">Send Us a Message</h2>
            <p className="contact-form-sub">Fill in the form below and our team will get back to you.</p>

            {status === 'success' ? (
              <div className="contact-success-state" role="status">
                <div className="contact-success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3>Message Received!</h3>
                <p>Thank you, <strong>{form.name || 'friend'}</strong>. We've received your message and will be in touch shortly.</p>
                <button
                  className="contact-send-again-btn"
                  onClick={() => setStatus('idle')}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>

                {/* Row 1: Name + Type */}
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="cf-name">Full Name <span className="req">*</span></label>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="cf-type">Nature of Inquiry</label>
                    <select id="cf-type" name="type" value={form.type} onChange={handleChange}>
                      {INQUIRY_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Email + Phone */}
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="cf-email">Email Address <span className="req">*</span></label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="cf-phone">Phone Number</label>
                    <input
                      id="cf-phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="contact-field">
                  <label htmlFor="cf-subject">Subject</label>
                  <input
                    id="cf-subject"
                    name="subject"
                    type="text"
                    placeholder="Brief subject line (optional)"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>

                {/* Message */}
                <div className="contact-field">
                  <label htmlFor="cf-message">Message <span className="req">*</span></label>
                  <textarea
                    id="cf-message"
                    name="message"
                    rows={6}
                    placeholder="Write your message here…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Error */}
                {(status === 'error' || errorMsg) && (
                  <p className="contact-form-error" role="alert">
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </p>
                )}

                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <span className="contact-spinner" aria-hidden="true" /> Sending…
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
