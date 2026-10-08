import { useEffect } from 'react'
import './ArticleModal.css'

export default function ArticleModal({ article, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  if (!article) return null

  return (
    <div className="article-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="article-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="article-modal-close"
          onClick={onClose}
          aria-label="Close article modal"
        >
          ✕
        </button>
        <div className="article-modal-header">
          {article.category && <span className="article-modal-category">{article.category}</span>}
          <h2 className="article-modal-title">{article.title}</h2>
        </div>
        <div className="article-modal-body">
          {article.paragraphs && article.paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
        <div className="article-modal-footer">
          <button type="button" className="article-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
