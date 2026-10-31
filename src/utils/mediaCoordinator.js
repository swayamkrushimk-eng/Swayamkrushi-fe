const MEDIA_EVENT = 'swayamkrushi-exclusive-media'

export function claimExclusiveMedia(ownerId, currentEl) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  document.querySelectorAll('video, audio').forEach((el) => {
    if (currentEl && el === currentEl) return
    if (ownerId && el.dataset.mediaOwner === ownerId) return
    if (!el.paused) el.pause()
  })

  window.dispatchEvent(new CustomEvent(MEDIA_EVENT, { detail: { ownerId } }))
}

export function subscribeExclusiveMedia(ownerId, onTakeover) {
  if (typeof window === 'undefined') return () => {}

  const handler = (event) => {
    if (event.detail?.ownerId === ownerId) return
    onTakeover()
  }

  window.addEventListener(MEDIA_EVENT, handler)
  return () => window.removeEventListener(MEDIA_EVENT, handler)
}

if (typeof document !== 'undefined') {
  document.addEventListener(
    'play',
    (event) => {
      const el = event.target
      if (!el || (el.tagName !== 'VIDEO' && el.tagName !== 'AUDIO')) return
      const ownerId = el.dataset.mediaOwner || `dom:${el.currentSrc || el.src || 'media'}`
      claimExclusiveMedia(ownerId, el)
    },
    true
  )
}
