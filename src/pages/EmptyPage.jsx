import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './EmptyPage.css'

export default function EmptyPage({
  category = 'Section',
  title = 'Page Title',
  lede = 'This section is currently being designed and drafted.',
  description = 'Detailed layout, editorial stories, and media for this section will be designed here soon.'
}) {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [title])

  return (
    <main className="empty-page-wrap">
      <nav className="empty-page-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span>/</span>
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{title}</span>
      </nav>

      <span className="empty-page-category">{category}</span>
      <h1 className="empty-page-title">{title}</h1>
      <p className="empty-page-lede">{lede}</p>

      <div className="empty-page-box">
        <div className="placeholder-icon">✦</div>
        <h3>Page Layout in Design</h3>
        <p>{description}</p>
        <Link to="/" className="back-link-btn">
          Return to Swayamkrushi Home
        </Link>
      </div>
    </main>
  )
}
