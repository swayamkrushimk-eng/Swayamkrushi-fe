import { useState, useRef, useEffect } from 'react'
import {
  generateCartesiaSpeech,
  prefetchCartesiaSpeech,
  buildArticleNarrationText,
} from '../services/cartesiaTts'
import './ArticleAudioPlayer.css'

export default function ArticleAudioPlayer({ article }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const audioRef = useRef(null)

  // Calculate approximate listen time based on word count (~140 wpm)
  const text = buildArticleNarrationText(article)
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 140))

  // Instant background prefetch when article mounts so clicking "Listen" is blazing fast!
  useEffect(() => {
    let isCancelled = false
    const prefetchTimer = setTimeout(() => {
      if (!isCancelled && text && article?.id) {
        prefetchCartesiaSpeech({ text, articleId: article.id }).then((url) => {
          if (!isCancelled && url) {
            setAudioUrl(url)
          }
        })
      }
    }, 250)

    return () => {
      isCancelled = true
      clearTimeout(prefetchTimer)
    }
  }, [article?.id, text])

  // Reset audio when article changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setIsLoading(false)
    setAudioUrl(null)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setIsExpanded(false)
  }, [article?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleStartListening = async () => {
    setError(null)
    setIsExpanded(true)

    // If audio is already loaded and ready in memory
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error('Audio play error:', err))
      }
      return
    }

    // Synthesize audio with fast parallel chunking
    setIsLoading(true)
    try {
      const { audioUrl: url } = await generateCartesiaSpeech({
        text,
        articleId: article?.id || 'current-article',
      })

      setAudioUrl(url)

      const audio = new Audio(url)
      audio.playbackRate = playbackRate

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0)
      }

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime || 0)
      }

      audio.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      audio.onerror = () => {
        setError('Playback failed. Please try again.')
        setIsPlaying(false)
        setIsLoading(false)
      }

      audioRef.current = audio

      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('Cartesia TTS error:', err)
      setError(err.message || 'Failed to generate voice narration.')
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current) {
      handleStartListening()
      return
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleSpeedToggle = () => {
    const speeds = [1.0, 1.25, 1.5, 0.8]
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length
    const nextSpeed = speeds[nextIdx]
    setPlaybackRate(nextSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
  }

  const handleSkip = (seconds) => {
    if (!audioRef.current) return
    const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
    audioRef.current.currentTime = target
    setCurrentTime(target)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setIsExpanded(false)
    setCurrentTime(0)
  }

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <aside className="article-audio-wrapper" aria-label="Article voice narration player">
      {!isExpanded ? (
        <div className="audio-speaker-only-wrap">
          <button
            type="button"
            className="audio-standalone-speaker-btn"
            onClick={handleStartListening}
            title="Listen to this article"
            aria-label="Listen to this article"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`audio-player-expanded ${isLoading ? 'is-loading' : ''} ${
            isPlaying ? 'is-playing' : ''
          }`}
        >
          <div className="player-top-row">
            <div className="player-meta-info">
              <div className="player-status-tag">
                <span className="audio-wave-anim" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span>{isLoading ? 'Loading audio...' : isPlaying ? 'Now Playing' : 'Voice Narration'}</span>
              </div>
              <span className="player-article-name">{article?.title}</span>
            </div>

            <button
              type="button"
              className="player-close-btn"
              onClick={handleClose}
              aria-label="Close audio player"
              title="Close player"
            >
              ✕
            </button>
          </div>

          {error ? (
            <div className="player-error-row">
              <span className="player-error-text">⚠️ {error}</span>
              <button
                type="button"
                className="player-retry-btn"
                onClick={handleStartListening}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Timeline scrubber row */}
              <div className="player-scrubber-row">
                <span className="player-time-current">{formatTime(currentTime)}</span>
                <div className="player-slider-container">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.5"
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={isLoading || !duration}
                    className="player-timeline-slider"
                    aria-label="Audio timeline position"
                    style={{
                      '--progress': duration ? `${(currentTime / duration) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="player-time-total">{formatTime(duration)}</span>
              </div>

              {/* Controls bar */}
              <div className="player-controls-row">
                <div className="player-controls-left">
                  <button
                    type="button"
                    className="player-ctrl-btn ctrl-skip"
                    onClick={() => handleSkip(-10)}
                    disabled={isLoading || !audioRef.current}
                    title="Rewind 10 seconds"
                    aria-label="Rewind 10 seconds"
                  >
                    ↺ 10s
                  </button>

                  <button
                    type="button"
                    className="player-ctrl-btn ctrl-main-play"
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isLoading ? (
                      <span className="player-spinner" aria-hidden="true"></span>
                    ) : isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    className="player-ctrl-btn ctrl-skip"
                    onClick={() => handleSkip(10)}
                    disabled={isLoading || !audioRef.current}
                    title="Forward 10 seconds"
                    aria-label="Forward 10 seconds"
                  >
                    10s ↻
                  </button>
                </div>

                <div className="player-controls-right">
                  <button
                    type="button"
                    className="player-ctrl-btn ctrl-speed"
                    onClick={handleSpeedToggle}
                    title="Adjust playback speed"
                    aria-label={`Playback speed: ${playbackRate}x`}
                  >
                    {playbackRate}x
                  </button>

                  <button
                    type="button"
                    className={`player-ctrl-btn ctrl-mute ${isMuted ? 'is-muted' : ''}`}
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  >
                    {isMuted ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  )
}
