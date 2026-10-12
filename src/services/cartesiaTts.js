/**
 * Cartesia AI Text-to-Speech Integration
 * High-fidelity neural voice narration service for Swayamkrushi articles.
 * Includes parallel chunk synthesis and instant background prefetching for fast loading.
 */

export const CARTESIA_CONFIG = {
  apiKey: 'sk_car_4sMRLui4F4FyMqxggsp2d3',
  voiceId: '82b82fba-9d48-4d4c-9c96-f53995791eea',
  modelId: 'sonic-3.5',
  version: '2024-11-13',
  endpoint: 'https://api.cartesia.ai/tts/bytes',
}

// In-memory cache to prevent re-fetching audio for the same article/text in the current session
const audioCache = new Map()
const inflightPromises = new Map()

/**
 * Strips HTML tags, Markdown links, and excess whitespace to produce clean speech text.
 */
export function cleanTextForSpeech(rawText = '') {
  if (!rawText) return ''
  return rawText
    // Remove HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Remove markdown image syntax ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Replace markdown links [text](url) with just text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Remove standalone URLs
    .replace(/https?:\/\/\S+/g, '')
    // Normalize dashes and special chars
    .replace(/—|–/g, ', ')
    // Normalize multiple spaces and newlines
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Splits text into natural sentence-boundary chunks of ~350-450 characters
 * for fast parallel Cartesia synthesis.
 */
export function splitTextIntoChunks(text, maxChunkSize = 400) {
  const clean = cleanTextForSpeech(text)
  if (!clean) return []
  if (clean.length <= maxChunkSize) return [clean]

  const sentences = clean.match(/[^.!?]+[.!?]+|\S+$/g) || [clean]
  const chunks = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).trim().length <= maxChunkSize) {
      currentChunk = (currentChunk + ' ' + sentence).trim()
    } else {
      if (currentChunk) chunks.push(currentChunk)
      currentChunk = sentence.trim()
    }
  }
  if (currentChunk) chunks.push(currentChunk)
  return chunks
}

/**
 * Prepares the complete spoken narrative for an article
 */
export function buildArticleNarrationText(article) {
  if (!article) return ''

  const parts = []

  // Add article title
  if (article.title) {
    parts.push(cleanTextForSpeech(article.title) + '.')
  }

  // Add quote if present
  if (article.quote) {
    parts.push(cleanTextForSpeech(article.quote))
  }

  // Add paragraphs or HTML text
  if (Array.isArray(article.paragraphs) && article.paragraphs.length > 0) {
    article.paragraphs.forEach((p) => {
      const cleaned = cleanTextForSpeech(p)
      if (cleaned) parts.push(cleaned)
    })
  } else if (article.contentHtml) {
    const cleaned = cleanTextForSpeech(article.contentHtml)
    if (cleaned) parts.push(cleaned)
  } else if (article.excerpt) {
    const cleaned = cleanTextForSpeech(article.excerpt)
    if (cleaned) parts.push(cleaned)
  }

  return parts.join(' ')
}

/**
 * Requests speech synthesis for a single text chunk from Cartesia AI.
 */
async function fetchSingleChunkAudio(chunkText, voiceId) {
  const payload = {
    model_id: CARTESIA_CONFIG.modelId,
    transcript: chunkText,
    voice: {
      mode: 'id',
      id: voiceId,
    },
    output_format: {
      container: 'mp3',
      sample_rate: 44100,
      bit_rate: 128000,
    },
  }

  const response = await fetch(CARTESIA_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'X-API-Key': CARTESIA_CONFIG.apiKey,
      'Cartesia-Version': CARTESIA_CONFIG.version,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Cartesia AI TTS error (${response.status}): ${errorText}`)
  }

  return await response.blob()
}

/**
 * Fast multi-chunk or single-request speech generator with parallel synthesis.
 * Significantly cuts latency by querying chunks in parallel and uniting audio.
 *
 * @param {Object} options
 * @param {string} options.text - Text to speak
 * @param {string} [options.articleId] - Optional cache key
 * @param {string} [options.voiceId] - Optional voice ID override
 * @returns {Promise<{ audioUrl: string, cached: boolean }>}
 */
export async function generateCartesiaSpeech({ text, articleId, voiceId }) {
  const cleanTranscript = cleanTextForSpeech(text)
  if (!cleanTranscript) {
    throw new Error('No readable text available to narrate.')
  }

  const effectiveVoiceId = voiceId || CARTESIA_CONFIG.voiceId
  const cacheKey = articleId ? `${articleId}-${effectiveVoiceId}` : cleanTranscript.slice(0, 80)

  // Check cache first
  if (audioCache.has(cacheKey)) {
    return {
      audioUrl: audioCache.get(cacheKey),
      cached: true,
    }
  }

  // Deduplicate inflight requests
  if (inflightPromises.has(cacheKey)) {
    return inflightPromises.get(cacheKey)
  }

  const fetchPromise = (async () => {
    try {
      // Split into fast chunks for parallel synthesis if long
      const chunks = splitTextIntoChunks(cleanTranscript, 450)

      let unitedBlob
      if (chunks.length <= 1) {
        unitedBlob = await fetchSingleChunkAudio(cleanTranscript, effectiveVoiceId)
      } else {
        // Fetch all chunks in parallel for maximum speed!
        const chunkBlobs = await Promise.all(
          chunks.map((chunk) => fetchSingleChunkAudio(chunk, effectiveVoiceId))
        )
        // Concatenate MP3 chunks into one unified audio Blob
        unitedBlob = new Blob(chunkBlobs, { type: 'audio/mpeg' })
      }

      const audioUrl = URL.createObjectURL(unitedBlob)
      audioCache.set(cacheKey, audioUrl)

      return {
        audioUrl,
        cached: false,
      }
    } finally {
      inflightPromises.delete(cacheKey)
    }
  })()

  inflightPromises.set(cacheKey, fetchPromise)
  return fetchPromise
}

/**
 * Background prefetch utility to warm cache before the user clicks Play.
 */
export function prefetchCartesiaSpeech({ text, articleId, voiceId }) {
  if (!text) return Promise.resolve(null)
  return generateCartesiaSpeech({ text, articleId, voiceId })
    .then((res) => res?.audioUrl || null)
    .catch((err) => {
      console.debug('Background prefetch idle:', err)
      return null
    })
}
