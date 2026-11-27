import { useState } from 'react'
import './ArticleShareButton.css'

function ShareIcon() {
  return (
    <svg
      className="article-share-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function buildShareUrl(articleId) {
  if (typeof window === 'undefined') {
    return `https://swayamkrushi.org/#/article/${articleId}`
  }
  if (articleId) {
    return `${window.location.origin}${window.location.pathname}#/article/${articleId}`
  }
  return window.location.href
}

export default function ArticleShareButton({ article, className = '' }) {
  const [isCopied, setIsCopied] = useState(false)
  const articleId = article?.id || article?._id
  const title = article?.title || 'Swayamkrushi'
  const text = article?.excerpt || article?.title || title

  const handleShare = async () => {
    const shareUrl = buildShareUrl(articleId)
    const shareData = { title, text, url: shareUrl }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch {
      // Cancelled or unavailable — fall through to clipboard
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2200)
      }
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      className={`article-share-btn ${isCopied ? 'is-copied' : ''} ${className}`.trim()}
      onClick={handleShare}
      title={isCopied ? 'Link copied' : 'Share article'}
      aria-label={isCopied ? 'Link copied' : `Share ${title}`}
    >
      <ShareIcon />
    </button>
  )
}
