import { useState, useEffect, useCallback } from 'react'
import './ImagePreviewModal.css'

export default function ImagePreviewModal() {
  const [previewSrc, setPreviewSrc] = useState(null)

  const handleClose = useCallback(() => {
    setPreviewSrc(null)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    if (previewSrc) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [previewSrc, handleClose])

  useEffect(() => {
    const handleImageClick = (e) => {
      // 1. Immediately ignore any click on or inside any video element or video container
      if (
        e.target.closest('video') ||
        e.target.closest('.pro-player-container') ||
        e.target.closest('.pro-player-stage') ||
        e.target.closest('.article-video-player-container') ||
        e.target.closest('.insider-video-player-container') ||
        e.target.closest('.insider-video-card-direct') ||
        e.target.closest('.article-embedded-video-card') ||
        e.target.closest('.article-hero-video-figure') ||
        e.target.closest('.main-story-video-container') ||
        e.target.closest('.rail-item-video-card') ||
        e.target.closest('.rail-video-play-center-btn') ||
        e.target.closest('.rail-thumb-video-wrapper') ||
        e.target.closest('.rail-video-placeholder-thumb') ||
        e.target.closest('[data-is-video="true"]') ||
        e.target.closest('[data-media-type="video"]') ||
        e.target.closest('.video-card') ||
        e.target.closest('.video-container') ||
        e.target.closest('.video-section')
      ) {
        return
      }

      const img = e.target.closest('img')
      if (!img) return

      // Do not trigger if inside the preview modal itself
      if (img.closest('.global-image-preview-overlay')) return

      // Do not trigger if marked with no-preview or part of a video thumbnail/poster
      if (
        img.classList.contains('no-preview') ||
        img.classList.contains('video-thumb') ||
        img.classList.contains('pro-video-poster') ||
        img.getAttribute('data-no-preview') === 'true' ||
        img.closest('.no-preview') ||
        img.closest('.hero-side-badge') ||
        img.closest('.rail-item-video-card') ||
        img.closest('.rail-video-play-center-btn') ||
        img.closest('.rail-thumb-video-wrapper') ||
        img.closest('.rail-video-placeholder-thumb') ||
        img.closest('.pro-player-container') ||
        img.closest('.pro-player-stage') ||
        img.closest('.article-video-player-container') ||
        img.closest('.insider-video-player-container') ||
        img.closest('.insider-video-card-direct') ||
        img.closest('.article-embedded-video-card') ||
        img.closest('.article-hero-video-figure') ||
        img.closest('.main-story-video-container') ||
        img.closest('[data-is-video="true"]') ||
        img.closest('[data-media-type="video"]') ||
        img.closest('.video-card') ||
        img.closest('.video-container') ||
        img.closest('.video-section') ||
        img.closest('video')
      ) {
        return
      }

      // Skip tiny UI icons/pixels
      if (img.naturalWidth > 0 && img.naturalWidth <= 32 && img.naturalHeight <= 32) {
        return
      }

      // If clicked inside an existing specialized page lightbox overlay
      if (
        img.closest('.accolades-lightbox-overlay') ||
        img.closest('.buzz-lightbox-overlay') ||
        img.closest('.events-lightbox-overlay') ||
        img.closest('.article-modal-card')
      ) {
        return
      }

      // If inside existing specialized gallery cards that handle their own lightbox
      if (
        img.closest('.events-gallery-item') ||
        img.closest('.buzz-featured-card') ||
        img.closest('.buzz-grid-item') ||
        img.closest('.accolades-gallery')
      ) {
        return
      }

      const src = img.currentSrc || img.src
      if (!src) return

      // Prevent navigating away if inside a link
      e.preventDefault()
      e.stopPropagation()

      setPreviewSrc(src)
    }

    document.addEventListener('click', handleImageClick, true)
    return () => {
      document.removeEventListener('click', handleImageClick, true)
    }
  }, [])

  if (!previewSrc) return null

  return (
    <div
      className="global-image-preview-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
    >
      <button
        type="button"
        className="global-image-preview-close"
        onClick={handleClose}
        aria-label="Close preview"
        title="Close (Esc)"
      >
        &times;
      </button>

      <div className="global-image-preview-dialog" onClick={(e) => e.stopPropagation()}>
        <img
          src={previewSrc}
          alt="Enlarged preview"
          className="global-image-preview-img"
        />
      </div>
    </div>
  )
}
