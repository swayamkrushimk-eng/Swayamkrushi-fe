import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSettings } from '../services/api'
import './WelcomeTour.css'

const STORAGE_KEY = 'swayamkrushi_welcome_tour_done'
const HOME_HOLD_MS = 10000
const ARTICLE_WAIT_MS = 2000
const DARE_TO_DREAM_PATH = '/article/dare-to-dream'

/**
 * Guided one-time tour (when admin toggle is ON):
 * white welcome (tap → true browser fullscreen) → home (10s) → Dare to Dream (2s) → play → home
 *
 * Native Fullscreen API requires a user gesture; the welcome tap unlocks it for the whole tour.
 */
export default function WelcomeTour() {
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [active, setActive] = useState(false)
  const timersRef = useRef([])
  const startedFlowRef = useRef(false)

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
      localStorage.setItem(STORAGE_KEY, '1')
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

  const beginTimedFlow = () => {
    setShowWelcome(false)
    setExiting(false)
    navigate('/', { replace: true })
    window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'home' } }))

    schedule(() => {
      navigate(`${DARE_TO_DREAM_PATH}?tour=1`)
      window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'article' } }))

      schedule(() => {
        window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'play' } }))
      }, ARTICLE_WAIT_MS)
    }, HOME_HOLD_MS)
  }

  const startFromWelcomeTap = async (e) => {
    e?.preventDefault?.()
    if (startedFlowRef.current || !active || !showWelcome) return
    startedFlowRef.current = true

    // True browser fullscreen (not CSS enlarge) — must run in this user-gesture handler
    try {
      const root = document.documentElement
      if (root.requestFullscreen) {
        await root.requestFullscreen({ navigationUI: 'hide' })
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen()
      }
    } catch {
      /* VideoPlayer will prompt again at play if needed */
    }

    setExiting(true)
    schedule(() => {
      beginTimedFlow()
    }, 400)
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
      try {
        if (localStorage.getItem(STORAGE_KEY) === '1') return
      } catch {
        /* ignore */
      }

      let enabled = false
      try {
        const settings = await fetchSettings()
        enabled = Boolean(settings?.welcomeTourEnabled)
      } catch {
        enabled = false
      }

      if (cancelled || !enabled) return

      setActive(true)
      setShowWelcome(true)
      window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'welcome' } }))
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
    <button
      type="button"
      className={`welcome-tour-overlay${exiting ? ' is-exiting' : ''}`}
      onPointerDown={startFromWelcomeTap}
      onClick={startFromWelcomeTap}
      aria-label="Welcome to Swayamkrushi — tap to enter"
    >
      <span className="welcome-tour-wordmark">
        <span className="welcome-tour-lead">Welcome to</span>
        <span className="welcome-tour-brand wordmark">Swayamkrushi</span>
      </span>
      <span className="welcome-tour-hint">Tap to enter</span>
    </button>
  )
}
