import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './EmptyPage.css'

export default function EmptyPage({
  category = 'Section',
  title = 'Page Title',
  lede = 'This section is currently being designed and drafted.',
  description = 'Detailed layout, editorial stories, and media for this section will be designed here soon.'
}) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [title])

  return (
    <main className="empty-page-wrap">
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
