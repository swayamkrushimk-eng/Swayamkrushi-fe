import { useState, useEffect, useRef } from 'react'
import { streamArticleAudio } from '../services/inworldTts'
import './ArticleAudioPlayer.css'

export default function ArticleAudioPlayer({ articleTitle, articleText, onClose }) {
  const [chunksMap, setChunksMap] = useState({})
  const [totalChunksCount, setTotalChunksCount] = useState(1)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)

  const audioElementRef = useRef(null)
  const chunksMapRef = useRef({})

  // Keep ref synchronized
  useEffect(() => {
    chunksMapRef.current = chunksMap
  }, [chunksMap])

  // Initialize the Audio instance once
  useEffect(() => {
    const audio = new Audio()
    audioElementRef.current = audio

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration || 0)
    const handleError = () => {
      setError('Audio playback error.')
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Start streaming synthesis on mount
  useEffect(() => {
    let active = true

    streamArticleAudio(articleText, (blobUrl, index, total) => {
      if (!active) return

      setTotalChunksCount(total)
      setChunksMap((prev) => ({
        ...prev,
        [index]: blobUrl
      }))

      // As soon as chunk 0 is ready, stop loading so audio starts immediately
      if (index === 0) {
        setIsLoading(false)
      }
    }).catch((err) => {
      if (active) {
        console.error('TTS Streaming error:', err)
        setError('Failed to generate speech. Please try again.')
        setIsLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [articleText])

  // Play current chunk whenever it becomes ready or when chunkIndex changes
  useEffect(() => {
    const audio = audioElementRef.current
    const currentUrl = chunksMap[currentChunkIndex]

    if (!audio || !currentUrl) return

    audio.src = currentUrl
    audio.playbackRate = playbackRate

    const handleEnded = () => {
      if (currentChunkIndex + 1 < totalChunksCount) {
        setCurrentChunkIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }

    audio.addEventListener('ended', handleEnded)

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.log('Autoplay deferred or error:', e)
        setIsPlaying(false)
      })

    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [chunksMap, currentChunkIndex, playbackRate, totalChunksCount])

  const togglePlayPause = () => {
    const audio = audioElementRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const handleSpeedToggle = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1
    setPlaybackRate(nextRate)
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextRate
    }
  }

  const handleSeek = (e) => {
    const seekTarget = parseFloat(e.target.value)
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = seekTarget
      setCurrentTime(seekTarget)
    }
  }

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return '0:00'
    const minutes = Math.floor(secs / 60)
    const seconds = Math.floor(secs % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="article-audio-bar" role="region" aria-label="Audio player">
      <div className="audio-bar-inner">
        {/* Play/Pause / Loading Button */}
        <button
          type="button"
          className="audio-play-btn"
          onClick={togglePlayPause}
          disabled={isLoading || !!error}
          aria-label={isPlaying ? 'Pause reading' : 'Play reading'}
        >
          {isLoading ? (
            <span className="audio-spinner" />
          ) : isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Audio Meta / Label */}
        <div className="audio-info-col">
          <div className="audio-status-row">
            <span className="audio-tag">
              {isLoading
                ? 'CONNECTING TO INWORLD AI...'
                : isPlaying
                ? 'LISTENING TO ARTICLE'
                : 'PAUSED'}
            </span>
            {isPlaying && (
              <span className="audio-wave-anim">
                <span className="bar b1" />
                <span className="bar b2" />
                <span className="bar b3" />
                <span className="bar b4" />
              </span>
            )}
          </div>
          <span className="audio-article-title">{articleTitle}</span>
        </div>

        {/* Scrubber & Time */}
        {!isLoading && !error && (
          <div className="audio-progress-group">
            <span className="audio-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="audio-scrubber"
              min="0"
              max={duration || 1}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio scrubber"
            />
            <span className="audio-time">{formatTime(duration)}</span>
          </div>
        )}

        {/* Speed Toggle */}
        <button
          type="button"
          className="audio-speed-btn"
          onClick={handleSpeedToggle}
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {/* Close Audio Bar */}
        <button
          type="button"
          className="audio-close-btn"
          onClick={() => {
            if (audioElementRef.current) {
              audioElementRef.current.pause()
            }
            if (onClose) onClose()
          }}
          title="Close audio reader"
          aria-label="Close audio reader"
        >
          &times;
        </button>
      </div>

      {error && <div className="audio-error-msg">{error}</div>}
    </div>
  )
}
