const INWORLD_AUTH_HEADER = 'Basic S29zRHNpX00wOUs5MVFUbGJXY2hPUWdVR2tuem5QOEY6X2p4ZUJKLS1BRHUyeWlNSHZ3QnRMaA=='
const VOICE_ID = 'bouncy-koi-5120__abbu'
const MODEL_ID = 'inworld-tts-2'
const TTS_ENDPOINT = 'https://api.inworld.ai/tts/v1/voice'

// In-memory audio cache to prevent repeated API calls
const audioCache = new Map()

/**
 * Splits article text into manageable speech segments (first chunk ~250-400 chars for instant playback, then ~800-1000 chars)
 */
function splitIntoNaturalChunks(text) {
  if (!text) return []

  const paragraphs = text.split(/\n\n+|(?<=[.!?])\s+(?=[A-Z0-9])/).filter(p => p.trim().length > 0)
  if (paragraphs.length <= 1) return [text]

  const chunks = []
  let current = ''

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim()
    if (!p) continue

    // First chunk is kept compact so playback starts lightning-fast
    const maxLimit = chunks.length === 0 ? 350 : 850

    if (!current) {
      current = p
    } else if (current.length + p.length + 1 <= maxLimit) {
      current += ' ' + p
    } else {
      chunks.push(current)
      current = p
    }
  }

  if (current) chunks.push(current)
  return chunks
}

/**
 * Synthesizes a single chunk of text into base64 audio via Inworld AI
 */
async function fetchInworldAudioChunk(text) {
  const cacheKey = text.trim()
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)
  }

  const response = await fetch(TTS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': INWORLD_AUTH_HEADER,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      voiceId: VOICE_ID,
      modelId: MODEL_ID
    })
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Inworld TTS Error (${response.status}): ${errText || response.statusText}`)
  }

  const data = await response.json()
  if (!data.audioContent) {
    throw new Error('No audio content returned from Inworld TTS API')
  }

  audioCache.set(cacheKey, data.audioContent)
  return data.audioContent
}

/**
 * Converts a base64 string to a playable Blob Object URL
 */
function base64ToBlobUrl(base64String, mimeType = 'audio/mp3') {
  const byteCharacters = atob(base64String)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })
  return URL.createObjectURL(blob)
}

/**
 * High-speed streaming synthesis pipeline:
 * Synthesizes and delivers chunk 0 immediately for instant playback,
 * while downloading subsequent chunks in parallel background workers.
 *
 * @param {string} text Full article text
 * @param {function} onChunkReady Callback when any chunk is synthesized: (blobUrl, index, totalChunks)
 */
export async function streamArticleAudio(text, onChunkReady) {
  const chunks = splitIntoNaturalChunks(text)
  if (chunks.length === 0) return

  // 1. Immediately fetch the first chunk for instant start
  const firstBase64 = await fetchInworldAudioChunk(chunks[0])
  const firstBlobUrl = base64ToBlobUrl(firstBase64)
  if (onChunkReady) {
    onChunkReady(firstBlobUrl, 0, chunks.length)
  }

  // 2. Concurrently pipeline all remaining chunks in parallel in the background
  if (chunks.length > 1) {
    const remainingPromises = chunks.slice(1).map(async (chunk, relIdx) => {
      const actualIdx = relIdx + 1
      try {
        const base64 = await fetchInworldAudioChunk(chunk)
        const blobUrl = base64ToBlobUrl(base64)
        if (onChunkReady) {
          onChunkReady(blobUrl, actualIdx, chunks.length)
        }
      } catch (err) {
        console.warn(`Error generating audio chunk ${actualIdx}:`, err)
      }
    })

    // Let parallel requests process in background without blocking first chunk playback
    Promise.allSettled(remainingPromises)
  }
}
