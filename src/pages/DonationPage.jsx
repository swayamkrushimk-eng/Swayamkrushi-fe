import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './DonationPage.css'

const PRESETS = [
  { id: '500', amount: 500, label: 'Meals for a week' },
  { id: '1500', amount: 1500, label: 'Training materials' },
  { id: '5000', amount: 5000, label: 'Monthly care' },
  { id: '15000', amount: 15000, label: 'SCIL scholarship' },
  { id: '50000', amount: 50000, label: 'B.Ed year' },
  { id: 'other', amount: '', label: 'Enter below' }
]

const IMPACT_TIERS = [
  { amount: '₹ 500', desc: 'Provides meals for one resident for a week' },
  { amount: '₹ 1,500', desc: 'Covers vocational training materials for one month' },
  { amount: '₹ 5,000', desc: 'Sponsors one month of full residential care for a child' },
  { amount: '₹ 15,000', desc: 'Funds a SCIL scholarship for one semester' },
  { amount: '₹ 50,000', desc: 'Supports a B.Ed student\'s full academic year' }
]

export default function DonationPage() {
  const [selectedPreset, setSelectedPreset] = useState('1500')
  const [amount, setAmount] = useState('1500')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id)
    if (preset.id === 'other') {
      setAmount('')
    } else {
      setAmount(String(preset.amount))
    }
  }

  const handleAmountChange = (e) => {
    const val = e.target.value
    setAmount(val)
    const match = PRESETS.find((p) => String(p.amount) === val)
    if (match) {
      setSelectedPreset(match.id)
    } else {
      setSelectedPreset('other')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid donation amount.')
      return
    }
    setShowModal(true)
  }

  return (
    <main className="donation-page-wrap">
      <SEO
        title="Donations & Support | Swayamkrushi"
        description="Give the gift of possibility. Your donation directly funds the care, education, and vocational training that transforms lives at Swayamkrushi."
        canonicalUrl="https://swayamkrushi.org/#/donation"
      />

      {/* ─── Hero Banner ─── */}
      <section className="donation-hero-banner">
        <div className="donation-hero-container">
          <h1 className="donation-hero-title">
            Give the gift of possibility
          </h1>
          <p className="donation-hero-sub">
            Your donation directly funds the care, education, and vocational training that transforms lives at Swayamkrushi
          </p>
        </div>
      </section>

      {/* ─── Main Content Grid ─── */}
      <div className="donation-content-wrap">
        <div className="donation-content-grid">

          {/* Left Column: Your Impact */}
          <div className="donation-impact-col">
            <h2 className="donation-impact-title">
              Every rupee matters
            </h2>

            <div className="donation-impact-list">
              {IMPACT_TIERS.map((tier, idx) => (
                <div key={idx} className="donation-impact-row">
                  <span className="donation-impact-amount">{tier.amount}</span>
                  <span className="donation-impact-desc">{tier.desc}</span>
                </div>
              ))}
            </div>

            {/* 80G Tax Exemption Card */}
            <div className="donation-tax-box">
              <div className="donation-tax-icon-wrap" aria-hidden="true">
                <svg
                  className="donation-tax-check-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="donation-tax-text">
                <h4>Tax Deductible under Section 80G</h4>
                <p>
                  Swayamkrushi is registered under Section 80G of the Income Tax Act. All donations are eligible for tax deduction. Receipt issued for all contributions
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Make a Donation Card */}
          <div className="donation-card">
            <h3 className="donation-card-title">Make a Donation</h3>
            <p className="donation-card-subtitle">Choose an amount or enter your own</p>

            {/* Preset Amount Grid */}
            <div className="donation-presets-grid" role="group" aria-label="Donation amount presets">
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  className={`donation-preset-btn ${selectedPreset === preset.id ? 'is-active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <span className="preset-amount">
                    {preset.id === 'other' ? 'Other' : `₹${preset.amount.toLocaleString('en-IN')}`}
                  </span>
                  <span className="preset-label">{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Donation Form */}
            <form className="donation-form" onSubmit={handleSubmit}>
              <div className="donation-form-group">
                <label htmlFor="donation-amount">AMOUNT (₹)</label>
                <input
                  id="donation-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={handleAmountChange}
                  className="donation-input"
                  required
                />
              </div>

              <div className="donation-form-group">
                <label htmlFor="donor-fullname">FULL NAME</label>
                <input
                  id="donor-fullname"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="donation-input"
                  required
                />
              </div>

              <div className="donation-form-group">
                <label htmlFor="donor-email">EMAIL</label>
                <input
                  id="donor-email"
                  type="email"
                  placeholder="For receipt & confirmation"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="donation-input"
                  required
                />
              </div>

              <div className="donation-form-group">
                <label htmlFor="donor-pan">PAN NUMBER (FOR 80G RECEIPT)</label>
                <input
                  id="donor-pan"
                  type="text"
                  placeholder="ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="donation-input"
                  maxLength={10}
                />
              </div>

              <button type="submit" className="donation-submit-btn">
                Donate Securely &rarr;
              </button>

              <div className="donation-security-footer">
                <span className="donation-lock-icon" aria-hidden="true">🔒</span>
                <span>Secure payment via Razorpay / Bank Transfer</span>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ─── Thank You / Bank Transfer Modal ─── */}
      {showModal && (
        <div className="donation-modal-overlay" onClick={() => setShowModal(false)} role="dialog" aria-modal="true">
          <div className="donation-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="donation-modal-badge" aria-hidden="true">✓</div>
            <h3 className="donation-modal-title">Thank You, {fullName || 'Supporter'}!</h3>
            <p className="donation-modal-msg">
              Your pledge of <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> will directly empower the residents and students at Swayamkrushi.
            </p>

            <div className="donation-bank-details">
              <h5>Direct Bank Transfer / NEFT / IMPS</h5>
              <div className="donation-bank-row">
                <span>Account Name</span>
                <span>Swayamkrushi</span>
              </div>
              <div className="donation-bank-row">
                <span>Bank Name</span>
                <span>State Bank of India</span>
              </div>
              <div className="donation-bank-row">
                <span>Account Number</span>
                <span>30248492048</span>
              </div>
              <div className="donation-bank-row">
                <span>IFSC Code</span>
                <span>SBIN0011662</span>
              </div>
              <div className="donation-bank-row">
                <span>UPI ID</span>
                <span>swayamkrushi@sbi</span>
              </div>
            </div>

            <button
              type="button"
              className="donation-modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              Close & Return
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
