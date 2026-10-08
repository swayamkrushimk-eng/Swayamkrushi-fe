import { useState, useRef, useEffect } from 'react'
import { getPlayableVideoUrl, getVideoThumbnailUrl } from '../utils/mediaUtils'
import './VideoPlayer.css'

export { getPlayableVideoUrl, getVideoThumbnailUrl }
export const getDeliveryVideoUrl = getPlayableVideoUrl
export const getOptimizedVideoUrl = getPlayableVideoUrl

export default function VideoPlayer({
  src,
  poster,
  title,
  subtitle,
  category,
  tag,
  durationText = '2:30',
  autoPlay = false,
  showTitleOverlay = false,
  aspectRatio = '21/9',
  objectFit = 'cover',
  className = '',
  style = {},
  onEnded,
  onNext,
  onPrev
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const hideControlsTimerRef = useRef(null)
  const playableVideoUrl = getPlayableVideoUrl(src)
  const resolvedPoster = poster || getVideoThumbnailUrl(src) || undefined

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [hoverTime, setHoverTime] = useState(null)
  const [hoverPos, setHoverPos] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Format time (seconds -> mm:ss)
  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec) || timeInSec < 0) return '00:00'
    const mins = Math.floor(timeInSec / 60)
    const secs = Math.floor(timeInSec % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Auto-hide controls when playing
  const resetControlsTimeout = () => {
    setShowControls(true)
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current)
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        if (!showSpeedMenu && isPlaying) {
          setShowControls(false)
        }
      }, 2500)
    }
  }

  useEffect(() => {
    setCurrentTime(0)
    setIsPlaying(false)
    setHasError(false)
    setErrorMessage('')

    if (autoPlay && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }

    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current)
    }
  }, [src])

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault()
        handleSkip(10)
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault()
        handleSkip(-10)
      } else if (e.key === 'm') {
        e.preventDefault()
        toggleMute()
      } else if (e.key === 'f') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, currentTime, duration, isMuted, volume])

  // Toggle Play / Pause
  const togglePlay = (forceState) => {
    if (!videoRef.current) return
    const nextState = typeof forceState === 'boolean' ? forceState : !isPlaying

    if (nextState) {
      setHasError(false)
      setErrorMessage('')
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setHasError(false)
          })
          .catch((err) => {
            console.error('Video playback error:', {
              originalUrl: src,
              playableUrl: playableVideoUrl,
              error: videoRef.current?.error || err
            })
            if (err.name === 'NotAllowedError') {
              if (videoRef.current) {
                videoRef.current.muted = true
                setIsMuted(true)
                videoRef.current
                  .play()
                  .then(() => setIsPlaying(true))
                  .catch(() => {
                    setHasError(true)
                    setErrorMessage('Click to play audio.')
                  })
              }
            } else {
              setHasError(true)
              setErrorMessage('Unable to play video.')
            }
          })
      }
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }

    resetControlsTimeout()
  }

  const handleRetry = (e) => {
    if (e) e.stopPropagation()
    setHasError(false)
    setErrorMessage('')
    if (videoRef.current) {
      videoRef.current.src = playableVideoUrl
      videoRef.current.load()
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setHasError(false)
          })
          .catch((err) => {
            console.error('Video retry failed:', {
              originalUrl: src,
              playableUrl: playableVideoUrl,
              error: videoRef.current?.error || err
            })
            setHasError(true)
            setErrorMessage('Unable to play video.')
          })
      }
    }
  }

  // Skip Forward / Rewind
  const handleSkip = (seconds) => {
    if (!videoRef.current) return
    const maxDur = duration || 100
    const newTime = Math.min(Math.max(0, currentTime + seconds), maxDur)
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    resetControlsTimeout()
  }

  // Scrubber seeking
  const handleScrubberChange = (e) => {
    if (!videoRef.current) return
    const newTime = parseFloat(e.target.value)
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleScrubberMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverPos(pos * 100)
    setHoverTime(pos * (duration || 100))
  }

  const handleScrubberMouseLeave = () => {
    setHoverTime(null)
  }

  // Volume Controls
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value)
    setVolume(newVol)
    const muted = newVol === 0
    setIsMuted(muted)

    if (videoRef.current) {
      videoRef.current.volume = newVol
      videoRef.current.muted = muted
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      const targetVol = volume === 0 ? 0.8 : volume
      setVolume(targetVol)
      if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.volume = targetVol
      }
    } else {
      setIsMuted(true)
      if (videoRef.current) {
        videoRef.current.muted = true
      }
    }
  }

  // Speed Menu
  const handleSpeedSelect = (speed) => {
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
    resetControlsTimeout()
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err)
      })
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err)
      })
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const containerAspect =
    !isFullscreen && aspectRatio
      ? aspectRatio.includes(':')
        ? aspectRatio.replace(':', ' / ')
        : aspectRatio
      : undefined

  return (
    <div
      ref={containerRef}
      className={`pro-player-container ${isFullscreen ? 'is-fullscreen' : ''} ${!showControls && isPlaying ? 'controls-hidden' : ''} ${className}`}
      style={{
        ...(containerAspect ? { aspectRatio: containerAspect } : {}),
        ...style
      }}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* ─── VIDEO SCREEN / STAGE ─── */}
      <div className="pro-player-stage" onClick={() => togglePlay()}>
        <video
          ref={videoRef}
          src={playableVideoUrl}
          poster={resolvedPoster}
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          style={{ objectFit: objectFit || 'cover' }}
          onTimeUpdate={() => {
            if (videoRef.current && !isSeeking) {
              setCurrentTime(videoRef.current.currentTime)
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current && videoRef.current.duration) {
              setDuration(videoRef.current.duration)
              setHasError(false)
            }
          }}
          onCanPlay={() => {
            setHasError(false)
          }}
          onPlaying={() => {
            setIsPlaying(true)
            setHasError(false)
          }}
          onPause={() => {
            setIsPlaying(false)
          }}
          onEnded={() => {
            setIsPlaying(false)
            if (onEnded) onEnded()
          }}
          onError={(e) => {
            const mediaErr = videoRef.current?.error || e?.target?.error
            console.error('Video element load/playback error:', {
              originalUrl: src,
              playableUrl: playableVideoUrl,
              error: mediaErr
            })
            if (isPlaying) {
              setHasError(true)
              setErrorMessage('Unable to play video.')
            }
          }}
          className="pro-video-element"
        >
          <source src={playableVideoUrl} type="video/mp4" />
        </video>

        {/* Optional Title Overlay (only if explicitly enabled) */}
        {showTitleOverlay && !isPlaying && (
          <div className="pro-top-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="pro-top-meta">
              {tag && <span className="pro-tag-badge">{tag}</span>}
              {category && <span className="pro-cat-badge">{category}</span>}
            </div>
            {title && <h3 className="pro-video-title">{title}</h3>}
          </div>
        )}

        {/* Big Center Play Button (only shown before playback begins) */}
        {!isPlaying && !hasError && (
          <button
            type="button"
            className="pro-big-center-play"
            onClick={(e) => {
              e.stopPropagation()
              togglePlay(true)
            }}
            aria-label="Play Video"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </button>
        )}

        {/* Error Fallback Banner */}
        {hasError && (
          <div className="pro-error-banner" onClick={(e) => e.stopPropagation()}>
            <p>{errorMessage || 'Unable to play this video.'}</p>
            <button
              type="button"
              className="pro-retry-btn"
              onClick={handleRetry}
            >
              Retry Video
            </button>
          </div>
        )}
      </div>

      {/* ─── BOTTOM CONTROL BAR ─── */}
      <div className="pro-controls-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Progress Timeline Scrubber */}
        <div
          className="pro-scrubber-container"
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
        >
          {hoverTime !== null && (
            <div
              className="pro-scrubber-tooltip"
              style={{ left: `${Math.max(4, Math.min(96, hoverPos))}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          <div className="pro-scrubber-track">
            <div className="pro-scrubber-progress" style={{ width: `${progressPercent}%` }} />
            <div className="pro-scrubber-thumb" style={{ left: `${progressPercent}%` }} />
          </div>

          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            onChange={handleScrubberChange}
            className="pro-scrubber-input"
            aria-label="Video timeline scrubber"
          />
        </div>

        {/* Main Controls Row */}
        <div className="pro-controls-row">
          {/* Left Group: Play, Rewind, Fast-Forward, Volume, Timestamps */}
          <div className="pro-controls-left">
            {/* Play / Pause Toggle */}
            <button
              type="button"
              className="pro-ctrl-btn pro-play-toggle-btn"
              onClick={() => togglePlay()}
              title={isPlaying ? 'Pause (Space / K)' : 'Play (Space / K)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              )}
            </button>

            {/* Rewind 10s */}
            <button
              type="button"
              className="pro-ctrl-btn"
              onClick={() => handleSkip(-10)}
              title="Rewind 10 seconds (Left Arrow / J)"
              aria-label="Rewind 10 seconds"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
              <span className="pro-btn-sublabel">10</span>
            </button>

            {/* Fast-Forward 10s */}
            <button
              type="button"
              className="pro-ctrl-btn"
              onClick={() => handleSkip(10)}
              title="Forward 10 seconds (Right Arrow / L)"
              aria-label="Forward 10 seconds"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
              </svg>
              <span className="pro-btn-sublabel">10</span>
            </button>

            {/* Volume Control Group */}
            <div className="pro-volume-group">
              <button
                type="button"
                className="pro-ctrl-btn"
                onClick={toggleMute}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              <div className="pro-volume-slider-box">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="pro-volume-slider"
                  style={{
                    background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                  }}
                  aria-label="Volume slider"
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="pro-time-badge">
              <span className="pro-time-current">{formatTime(currentTime)}</span>
              <span className="pro-time-divider">/</span>
              <span className="pro-time-total">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Group: Speed Menu, Fullscreen */}
          <div className="pro-controls-right">
            {onPrev && (
              <button
                type="button"
                className="pro-ctrl-btn"
                onClick={onPrev}
                title="Previous Story"
                aria-label="Previous story"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
            )}

            {onNext && (
              <button
                type="button"
                className="pro-ctrl-btn"
                onClick={onNext}
                title="Next Story"
                aria-label="Next story"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            )}

            {/* Playback Speed Menu */}
            <div className="pro-speed-dropdown-wrapper">
              <button
                type="button"
                className="pro-ctrl-btn pro-speed-btn"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                title="Playback Speed"
                aria-label="Playback speed"
              >
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="pro-speed-menu">
                  <div className="pro-speed-menu-header">Playback Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`pro-speed-opt ${playbackSpeed === s ? 'active' : ''}`}
                      onClick={() => handleSpeedSelect(s)}
                    >
                      <span>{s === 1 ? '1x (Normal)' : `${s}x`}</span>
                      {playbackSpeed === s && <span className="speed-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              className="pro-ctrl-btn pro-fs-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
