import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../services/api'
import './WelcomeTour.css'

const DONE_PREFIX = 'swayamkrushi_welcome_tour_done_v'
const LEGACY_DONE_KEY = 'swayamkrushi_welcome_tour_done'
const WELCOME_MS = 2800
const HOME_HOLD_MS = 10000
const ARTICLE_WAIT_MS = 2000

async function fetchTourSettings() {
  // Always hit the network — shared settings cache can be stale without welcomeTourEnabled
  const res = await fetch(`${API_BASE_URL}/settings?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('settings fetch failed')
  return res.json()
}

function doneKeyFor(version) {
  return `${DONE_PREFIX}${Number(version) || 1}`
}

/**
 * Normalize an admin-provided article link into a HashRouter path with ?tour=1.
 * Accepts full site URLs, hash routes, or /article/… paths.
 */
export function resolveTourArticlePath(rawUrl = '') {
  const raw = String(rawUrl || '').trim()
  if (!raw) return ''

  let path = raw
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw)
      path = u.hash?.startsWith('#') ? u.hash.slice(1) : u.pathname
    } else if (raw.startsWith('#')) {
      path = raw.slice(1)
    }
  } catch {
    path = raw
  }

  path = path.split('?')[0].split('#')[0].trim()
  if (!path) return ''
  if (!path.startsWith('/')) path = `/${path}`

  // Bare article id → /article/:id
  if (!path.startsWith('/article/') && !path.startsWith('/events') && path !== '/') {
    const maybeId = path.replace(/^\//, '')
    if (maybeId && !maybeId.includes('/')) {
      path = `/article/${maybeId}`
    }
  }

  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}tour=1`
}

/**
 * Fully automatic guided tour (when admin toggle is ON):
 * white welcome → home (10s) → admin-configured article video → home
 */
export default function WelcomeTour() {
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [active, setActive] = useState(false)
  const timersRef = useRef([])
  const tourVersionRef = useRef(1)
  const tourTargetRef = useRef('')

  const clearTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
  }

  const schedule = (fn, ms) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  const markDone = () => {
    try {
      localStorage.setItem(doneKeyFor(tourVersionRef.current), '1')
      localStorage.removeItem(LEGACY_DONE_KEY)
      sessionStorage.removeItem('swayamkrushi_tour_fs')
    } catch {
      /* ignore */
    }
    clearTimers()
    setActive(false)
    setShowWelcome(false)
  }

  const exitFullscreenSafe = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let cancelled = false

    const onTourEvent = async (e) => {
      if (e?.detail?.phase === 'video-ended') {
        await exitFullscreenSafe()
        markDone()
        navigate('/', { replace: true })
      }
    }
    window.addEventListener('swayamkrushi_welcome_tour', onTourEvent)

    async function boot() {
      let enabled = false
      let version = 1
      let targetPath = ''
      try {
        const settings = await fetchTourSettings()
        enabled = Boolean(settings?.welcomeTourEnabled)
        version = Number(settings?.welcomeTourVersion) || 1
        targetPath = resolveTourArticlePath(settings?.welcomeTourVideoUrl)
      } catch {
        enabled = false
      }

      if (cancelled || !enabled) return

      tourVersionRef.current = version
      tourTargetRef.current = targetPath

      try {
        // Prior "done" flags permanently blocked the tour even with the admin toggle ON.
        // Clear legacy + one-time wipe of versioned keys so this fix can run again.
        localStorage.removeItem(LEGACY_DONE_KEY)
        const resetFlag = 'swayamkrushi_tour_storage_reset_v1'
        if (!localStorage.getItem(resetFlag)) {
          Object.keys(localStorage).forEach((key) => {
            if (key === LEGACY_DONE_KEY || key.startsWith(DONE_PREFIX)) {
              localStorage.removeItem(key)
            }
          })
          localStorage.setItem(resetFlag, '1')
        }
        if (localStorage.getItem(doneKeyFor(version)) === '1') return
      } catch {
        /* ignore */
      }

      setActive(true)
      setShowWelcome(true)
      try {
        sessionStorage.setItem('swayamkrushi_tour_fs', '1')
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'welcome' } }))

      schedule(() => {
        if (cancelled) return
        setExiting(true)
        schedule(() => {
          if (cancelled) return
          setShowWelcome(false)
          setExiting(false)
          navigate('/', { replace: true })
          window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'home' } }))

          schedule(() => {
            if (cancelled) return
            const dest = tourTargetRef.current
            if (!dest) {
              // No article URL configured — end tour on home
              markDone()
              return
            }
            navigate(dest)
            window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'article' } }))

            schedule(() => {
              if (cancelled) return
              window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'play' } }))
            }, ARTICLE_WAIT_MS)
          }, HOME_HOLD_MS)
        }, 550)
      }, WELCOME_MS)
    }

    boot()

    return () => {
      cancelled = true
      clearTimers()
      window.removeEventListener('swayamkrushi_welcome_tour', onTourEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!active || !showWelcome) return null

  return (
    <div
      className={`welcome-tour-overlay${exiting ? ' is-exiting' : ''}`}
      role="dialog"
      aria-label="Welcome to Swayamkrushi"
      aria-live="polite"
    >
      <h1 className="welcome-tour-wordmark">
        <span className="welcome-tour-lead">Welcome to</span>
        <span className="welcome-tour-brand wordmark">Swayamkrushi</span>
      </h1>
    </div>
  )
}
