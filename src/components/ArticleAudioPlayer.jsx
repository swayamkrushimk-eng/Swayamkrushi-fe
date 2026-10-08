import { useState, useEffect, useRef, useCallback } from 'react'
import { streamArticleAudio } from '../services/inworldTts'
import './ArticleAudioPlayer.css'

export default function ArticleAudioPlayer({ articleTitle, articleText, onClose }) {
  const [engine, setEngine] = useState('inworld') // 'inworld' | 'speechSynthesis'
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
  const speechSynthUtteranceRef = useRef(null)
  const speechTimerRef = useRef(null)
  const speechElapsedRef = useRef(0)

  // Estimated reading duration in seconds (~150 words per minute)
  const estimatedTotalDuration = Math.max(
    30,
    Math.round(((articleText || '').split(/\s+/).length / 150) * 60)
  )

  // Helper to pick best natural voice for Web Speech API
  const getBestVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Karen'))) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    )
  }, [])

  // Start Speech Synthesis fallback
  const startSpeechSynthesis = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setError('Audio narration is not supported in this browser.')
      setIsLoading(false)
      return
    }

    setEngine('speechSynthesis')
    setIsLoading(false)
    setDuration(estimatedTotalDuration)

    window.speechSynthesis.cancel()

    // Clean text of markdown/tags
    const cleanSpeech = articleText
      .replace(/<[^>]*>/g, ' ')
      .replace(/&mdash;/g, ' — ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanSpeech)
    utterance.rate = playbackRate
    utterance.pitch = 1.0

    const bestVoice = getBestVoice()
    if (bestVoice) utterance.voice = bestVoice

    utterance.onstart = () => {
      setIsPlaying(true)
      setError(null)
      speechElapsedRef.current = 0
      clearInterval(speechTimerRef.current)
      speechTimerRef.current = setInterval(() => {
        speechElapsedRef.current += 0.5 * playbackRate
        setCurrentTime(Math.min(speechElapsedRef.current, estimatedTotalDuration))
      }, 500)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      clearInterval(speechTimerRef.current)
      setCurrentTime(estimatedTotalDuration)
    }

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e)
      }
      setIsPlaying(false)
      clearInterval(speechTimerRef.current)
    }

    speechSynthUtteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [articleText, playbackRate, estimatedTotalDuration, getBestVoice])

  // Initialize Inworld Audio instance
  useEffect(() => {
    const audio = new Audio()
    audioElementRef.current = audio

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration || estimatedTotalDuration)
    const handleError = () => {
      // If Inworld audio element errors, fallback to speech synthesis
      startSpeechSynthesis()
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
  }, [estimatedTotalDuration, startSpeechSynthesis])

  // Try Inworld Streaming on mount; on 402 / error immediately fallback to Web Speech
  useEffect(() => {
    let active = true

    streamArticleAudio(articleText, (blobUrl, index, total) => {
      if (!active) return

      setTotalChunksCount(total)
      setChunksMap((prev) => ({
        ...prev,
        [index]: blobUrl
      }))

      if (index === 0) {
        setIsLoading(false)
      }
    }).catch((err) => {
      if (!active) return
      console.info('Switching to native voice narration engine (Inworld fallback):', err.message || err)
      startSpeechSynthesis()
    })

    return () => {
      active = false
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      clearInterval(speechTimerRef.current)
    }
  }, [articleText, startSpeechSynthesis])

  // Play Inworld chunk when URL becomes ready
  useEffect(() => {
    if (engine !== 'inworld') return

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
        console.log('Audio playback info:', e)
      })

    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [chunksMap, currentChunkIndex, playbackRate, totalChunksCount, engine])

  const togglePlayPause = () => {
    if (engine === 'speechSynthesis') {
      if (!('speechSynthesis' in window)) return
      if (isPlaying) {
        window.speechSynthesis.pause()
        setIsPlaying(false)
        clearInterval(speechTimerRef.current)
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
          setIsPlaying(true)
          speechTimerRef.current = setInterval(() => {
            speechElapsedRef.current += 0.5 * playbackRate
            setCurrentTime(Math.min(speechElapsedRef.current, estimatedTotalDuration))
          }, 500)
        } else {
          startSpeechSynthesis()
        }
      }
      return
    }

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

    if (engine === 'speechSynthesis') {
      if (isPlaying) {
        startSpeechSynthesis()
      }
      return
    }

    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextRate
    }
  }

  const handleSeek = (e) => {
    const seekTarget = parseFloat(e.target.value)
    if (engine === 'speechSynthesis') {
      setCurrentTime(seekTarget)
      speechElapsedRef.current = seekTarget
      return
    }

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
                ? 'INITIALIZING VOICE NARRATION...'
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
              max={duration || estimatedTotalDuration || 1}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio scrubber"
            />
            <span className="audio-time">{formatTime(duration || estimatedTotalDuration)}</span>
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
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel()
            }
            clearInterval(speechTimerRef.current)
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
