import { useState, useEffect, useMemo } from 'react'
import SEO from '../components/SEO'
import { fetchSettings } from '../services/api'
import './DonationPage.css'

const IMPACT_TIERS = [
  { amount: '₹ 500', desc: 'Provides meals for one resident for a week' },
  { amount: '₹ 1,500', desc: 'Covers vocational training materials for one month' },
  { amount: '₹ 5,000', desc: 'Sponsors one month of full residential care for a child' },
  { amount: '₹ 15,000', desc: 'Funds a SCIL scholarship for one semester' },
  { amount: '₹ 50,000', desc: 'Supports a B.Ed student\'s full academic year' }
]

const DEFAULT_BANK = {
  orgName: 'SWAYAMKRUSHI',
  upiId: 'SWAYAMKRUSHI@SBI'
}

function buildUpiUri({ upiId, payeeName }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    cu: 'INR'
  })
  return `upi://pay?${params.toString()}`
}

function buildQrSrc(upiUri) {
  const q = new URLSearchParams({
    size: '360x360',
    ecc: 'M',
    margin: '12',
    color: '631932',
    bgcolor: 'ffffff',
    data: upiUri
  })
  return `https://api.qrserver.com/v1/create-qr-code/?${q.toString()}`
}

export default function DonationPage() {
  const [bank, setBank] = useState(DEFAULT_BANK)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchSettings().then((data) => {
      if (!data) return
      setBank({
        orgName: (data.orgName || DEFAULT_BANK.orgName).toUpperCase(),
        upiId: (data.upiId || DEFAULT_BANK.upiId).toUpperCase()
      })
    })
  }, [])

  const qrSrc = useMemo(() => {
    const uri = buildUpiUri({ upiId: bank.upiId, payeeName: bank.orgName })
    return buildQrSrc(uri)
  }, [bank.upiId, bank.orgName])

  return (
    <main className="donation-page-wrap">
      <SEO
        title="Donations & Support | Swayamkrushi"
        description="Give the gift of possibility. Your donation directly funds the care, education, and vocational training that transforms lives at Swayamkrushi."
        canonicalUrl="https://swayamkrushi.org/#/donation"
      />

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

      <div className="donation-content-wrap">
        <div className="donation-content-grid">

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

          </div>

          <div className="donation-card donation-card--qr-only">
            <div className="donation-card-upi" aria-label="Scan and pay with UPI">
              <div className="donation-card-upi-frame">
                <img
                  src={qrSrc}
                  alt={`UPI QR code for ${bank.upiId}`}
                  width={320}
                  height={320}
                  className="donation-card-upi-qr"
                  loading="lazy"
                />
              </div>
              <p className="donation-card-upi-scan">Scan &amp; Pay</p>
              <p className="donation-card-upi-id">{bank.upiId}</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
