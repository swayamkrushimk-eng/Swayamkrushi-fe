import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../services/api'
import './WelcomeTour.css'

const DONE_PREFIX = 'swayamkrushi_welcome_tour_done_v'
const LEGACY_DONE_KEY = 'swayamkrushi_welcome_tour_done'
const WELCOME_MS = 2800
const HOME_HOLD_MS = 10000

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
 * Resolve admin tour URL for a full browser redirect (not an in-app route).
 */
export function resolveTourRedirectUrl(rawUrl = '') {
  const raw = String(rawUrl || '').trim()
  if (!raw) return ''

  if (/^https?:\/\//i.test(raw)) return raw

  // Protocol-relative
  if (raw.startsWith('//')) {
    return `${window.location.protocol}${raw}`
  }

  // Absolute path on current origin
  if (raw.startsWith('/')) {
    return `${window.location.origin}${raw}`
  }

  // Bare domain or path — prefer https
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/:].*)?$/i.test(raw)) {
    return `https://${raw}`
  }

  try {
    return new URL(raw, window.location.origin).href
  } catch {
    return raw
  }
}

/**
 * Fully automatic guided tour (when admin toggle is ON):
 * white welcome → home (10s) → full redirect to admin URL
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

  useEffect(() => {
    let cancelled = false

    async function boot() {
      let enabled = false
      let version = 1
      let targetUrl = ''
      try {
        const settings = await fetchTourSettings()
        enabled = Boolean(settings?.welcomeTourEnabled)
        version = Number(settings?.welcomeTourVersion) || 1
        targetUrl = resolveTourRedirectUrl(settings?.welcomeTourVideoUrl)
      } catch {
        enabled = false
      }

      if (cancelled || !enabled) return

      tourVersionRef.current = version
      tourTargetRef.current = targetUrl

      try {
        // Prior "done" flags permanently blocked the tour even with the admin toggle ON.
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
              markDone()
              return
            }
            // Leave the SPA entirely — full browser redirect to the admin URL
            markDone()
            window.location.assign(dest)
          }, HOME_HOLD_MS)
        }, 550)
      }, WELCOME_MS)
    }

    boot()

    return () => {
      cancelled = true
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!active || !showWelcome) return null

  return (
    <div
      className={`welcome-tour-overlay${exiting ? ' is-exiting' : ''}`}
      role="dialog"
      aria-label="Welcome to Swayamkrushi website"
      aria-live="polite"
    >
      <h1 className="welcome-tour-wordmark">
        <span className="welcome-tour-lead">Welcome to</span>
        <span className="welcome-tour-brand wordmark">Swayamkrushi website</span>
      </h1>
    </div>
  )
}
