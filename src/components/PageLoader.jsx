import React from 'react'
import logoImg from '../assets/images/logo.png'
import './PageLoader.css'

export default function PageLoader({ fadeOut = false }) {
  return (
    <div className={`page-loader-overlay ${fadeOut ? 'page-loader-fade-out' : ''}`} aria-label="Loading page content">
      <div className="page-loader-card">
        <div className="page-loader-logo-wrap">
          <img src={logoImg} alt="Swayamkrushi Logo" className="page-loader-logo" />
          <div className="page-loader-spinner-ring" />
        </div>
        <h2 className="page-loader-title">SWAYAMKRUSHI</h2>
        <p className="page-loader-sub">Self reliance for persons with intellectual disabilities &middot; Reg. No. 3608/1991</p>
        <div className="page-loader-progress-bar">
          <div className="page-loader-progress-fill" />
        </div>
      </div>
    </div>
  )
}
