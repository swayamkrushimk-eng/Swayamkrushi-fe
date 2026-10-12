import { useState, useEffect } from 'react'
import { annualReports } from '../data/annualReportsData'
import SEO from '../components/SEO'
import './AnnualReportsPage.css'

export default function AnnualReportsPage() {
  const [activeReport, setActiveReport] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Keyboard navigation for document viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeReport) {
        setActiveReport(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeReport])

  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="annual-reports-page-wrap">
      <SEO
        title="Annual Reports — Transparency & Governance | Swayamkrushi"
        description="View and download Swayamkrushi annual reports for 2024–2025 and 2025–2026. Explore our audited accounts, developmental milestones, group home initiatives, and inclusive education programmes."
        keywords="Swayamkrushi annual reports, NGO annual report Hyderabad, special education annual report 2024-2025, Swayamkrushi report 2025-2026, intellectual disability NGO disclosures"
        canonicalUrl="https://swayamkrushi.org/#/annual-reports"
      />

      <div className="annual-reports-shell">
        <header className="reports-editorial-header" style={{ marginBottom: '2rem' }}>
          <h1 className="reports-main-title">Annual Reports</h1>
        </header>

        {/* Annual Report Cards Grid: strictly exactly 2 cards (2024-2025 first, 2025-2026 second) */}
        <div className="annual-reports-cards-grid">
          {[
            annualReports.find((r) => r.id === 'annual-report-2024-2025' || r.year === '2024-2025'),
            annualReports.find((r) => r.id === 'annual-report-2025-2026' || r.year === '2025-2026'),
          ].filter(Boolean).map((report) => (
            <article key={report.id} className={`annual-report-card ${report.isLatest ? 'is-latest-card' : ''}`}>
              <div className="report-card-top-bar">
                <span className={`report-status-badge ${report.isLatest ? 'badge-latest' : 'badge-archive'}`}>
                  {report.isLatest ? '⭐ Latest Report' : '📁 Annual Report'}
                </span>
                <span className="report-year-tag">{report.year}</span>
              </div>

              <div className="report-card-body">
                <div className="report-card-cover-graphic" aria-hidden="true">
                  <div className="docx-cover-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span className="docx-label">DOCX</span>
                  </div>
                  <div className="cover-title-snippet">
                    <span className="cover-org-label">SWAYAMKRUSHI</span>
                    <span className="cover-year-label">{report.year}</span>
                  </div>
                </div>

                <div className="report-card-details">
                  <h3 className="report-card-title">{report.title}</h3>
                  <h4 className="report-card-subtitle">{report.subtitle}</h4>

                  <p className="report-card-summary">{report.summary}</p>

                  <div className="report-meta-chips-list">
                    <span className="report-meta-chip">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      Word Document (.docx)
                    </span>
                    <span className="report-meta-chip">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Period: {report.period}
                    </span>
                    <span className="report-meta-chip">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Size: {report.fileSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View and Download */}
              <div className="report-card-actions">
                <button
                  type="button"
                  className="report-btn report-btn-view"
                  onClick={() => setActiveReport(report)}
                  aria-label={`View ${report.title} in reader`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>View Report</span>
                </button>

                <a
                  href={report.downloadUrl}
                  download={report.fileName}
                  className="report-btn report-btn-download"
                  aria-label={`Download ${report.title} (${report.fileSize})`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download (.docx)</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ─── INTERACTIVE DOCUMENT VIEWER MODAL ───────────────────────── */}
      {activeReport && (
        <div
          className="report-viewer-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="viewer-modal-title"
          onClick={() => setActiveReport(null)}
        >
          <div
            className="report-viewer-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <header className="report-viewer-header">
              <div className="viewer-header-info">
                <span className="viewer-tag">{activeReport.year}</span>
                <h2 id="viewer-modal-title" className="viewer-title">{activeReport.title}</h2>
              </div>

              <div className="viewer-controls">
                <button
                  type="button"
                  className="viewer-ctrl-btn btn-print"
                  onClick={handlePrint}
                  title="Print or Save as PDF"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  <span>Print / PDF</span>
                </button>

                <a
                  href={activeReport.downloadUrl}
                  download={activeReport.fileName}
                  className="viewer-ctrl-btn btn-download-docx"
                  title="Download Microsoft Word file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download (.docx)</span>
                </a>

                <button
                  type="button"
                  className="viewer-close-btn"
                  onClick={() => setActiveReport(null)}
                  aria-label="Close document viewer"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Modal Document Body */}
            <div className="report-viewer-content-area">
              <div className="report-document-sheet">
                <div
                  className="report-docx-html-body"
                  dangerouslySetInnerHTML={{ __html: activeReport.htmlContent }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
