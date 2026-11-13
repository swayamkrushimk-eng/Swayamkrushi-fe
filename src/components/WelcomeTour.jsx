import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSettings } from '../services/api'
import './WelcomeTour.css'

const STORAGE_KEY = 'swayamkrushi_welcome_tour_done'
const WELCOME_MS = 2800
const HOME_HOLD_MS = 10000
const ARTICLE_WAIT_MS = 2000
const DARE_TO_DREAM_PATH = '/article/dare-to-dream'

/**
 * Fully automatic guided tour (when admin toggle is ON):
 * white welcome → home (10s) → Dare to Dream (2s) → fullscreen play → home
 * No tap / click prompts at any step.
 */
export default function WelcomeTour() {
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [active, setActive] = useState(false)
  const timersRef = useRef([])

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
      try {
        sessionStorage.setItem('swayamkrushi_tour_fs', '1')
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new CustomEvent('swayamkrushi_welcome_tour', { detail: { phase: 'welcome' } }))

      // Try native FS opportunistically (may be blocked without gesture — player uses immersive cover)
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        }
      } catch {
        /* automatic immersive player covers this */
      }

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
            navigate(`${DARE_TO_DREAM_PATH}?tour=1`)
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
