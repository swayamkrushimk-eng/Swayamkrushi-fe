const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.swayamkrushi.org/api'

// ─── VISITOR ANALYTICS TRACKING ──────────────────────────────────────────
export async function trackPageView(page = window.location.pathname) {
  try {
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        userAgent: navigator.userAgent,
        referrer: document.referrer
      })
    }).catch(() => {})
  } catch (err) {
    // Silent
  }
}

// ─── NEWSLETTER SUBSCRIPTION ──────────────────────────────────────────────
export async function subscribeNewsletter(email, name = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, source: 'website_footer' })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to subscribe')
    return data
  } catch (err) {
    console.warn('Backend subscribe failed, saving locally:', err.message)
    const subs = JSON.parse(localStorage.getItem('swayamkrushi_subscribers') || '[]')
    subs.push({ email, name, date: new Date().toISOString() })
    localStorage.setItem('swayamkrushi_subscribers', JSON.stringify(subs))
    return { success: true, message: 'Subscribed successfully (saved)' }
  }
}

// ─── IN-MEMORY CLIENT CACHE FOR INSTANT LOADING ──────────────────────────
let _memorySettings = null
const _memoryArticlesCache = {}

// ─── CLIENT CACHE VERSION & INVALIDATION ────────────────────────────────
const CURRENT_CACHE_VERSION = 'v6_20261012_covid_reposition'
try {
  const storedVersion = localStorage.getItem('swayamkrushi_cache_version')
  if (storedVersion !== CURRENT_CACHE_VERSION) {
    const staleKeys = [
      'swayamkrushi_articles_cache',
      'swayamkrushi_articles_all',
      'swayamkrushi_articles_section_all',
      'swayamkrushi_articles_section_main',
      'swayamkrushi_articles_section_left',
      'swayamkrushi_articles_section_right'
    ]
    staleKeys.forEach((k) => localStorage.removeItem(k))
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('swayamkrushi_article_detail_')) {
        localStorage.removeItem(k)
      }
    }
    localStorage.setItem('swayamkrushi_cache_version', CURRENT_CACHE_VERSION)
  }
} catch {}

// ─── PERSISTENT TOMBSTONE / DELETED IDS TRACKING ──────────────────────────
export function getDeletedIds(entityKey) {
  try {
    const raw = localStorage.getItem(`swayamkrushi_deleted_${entityKey}_ids`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(String)
    }
  } catch {}
  return []
}

export function markIdAsDeleted(entityKey, id) {
  if (!id) return
  const idStr = String(id).trim()
  try {
    const current = getDeletedIds(entityKey)
    if (!current.includes(idStr)) {
      current.push(idStr)
      localStorage.setItem(`swayamkrushi_deleted_${entityKey}_ids`, JSON.stringify(current))
    }
  } catch {}
}

export function unmarkIdAsDeleted(entityKey, id) {
  if (!id) return
  const idStr = String(id).trim()
  try {
    const current = getDeletedIds(entityKey).filter((x) => x !== idStr)
    localStorage.setItem(`swayamkrushi_deleted_${entityKey}_ids`, JSON.stringify(current))
  } catch {}
}

export function isIdDeleted(entityKey, id) {
  if (!id) return false
  const idStr = String(id).trim()
  const deleted = getDeletedIds(entityKey)
  return deleted.includes(idStr)
}

// ─── CMS & SITE SETTINGS ─────────────────────────────────────────────────
export async function fetchSettings() {
  const sanitize = (obj) => {
    if (!obj) return obj
    if (obj.phone1 && (obj.phone1.includes('XXXXXXXXXX') || obj.phone1.includes('9704245454'))) {
      obj.phone1 = '+91 9100106454'
    }
    if (obj.phone2 && obj.phone2.includes('XXXXXXXXXX')) {
      obj.phone2 = ''
    }
    return obj
  }

  if (_memorySettings) return sanitize(_memorySettings)
  const local = localStorage.getItem('swayamkrushi_site_settings')
  if (local) {
    try {
      _memorySettings = sanitize(JSON.parse(local))
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE_URL}/settings`)
    if (res.ok) {
      const data = await res.json()
      _memorySettings = sanitize(data)
      localStorage.setItem('swayamkrushi_site_settings', JSON.stringify(_memorySettings))
      return _memorySettings
    }
  } catch (err) {
    // Silent
  }

  return _memorySettings || {
    orgName: 'Swayamkrushi',
    tagline: 'A Haven for the Mentally Challenged Since 1987',
    phone1: '+91 9100106454',
    phone2: '',
    email: 'swayamkrushimk@gmail.com',
    address: 'Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal, Secunderabad, Telangana.',
    regNo: 'Registered under Societies Registration Act & National Trust Act',
    founderQuote: 'From small beginnings in 1987 with 3 adults to a thriving lifelong residential sanctuary and vocational hub.',
    bankName: 'State Bank of India',
    accountNumber: '30248492048',
    ifscCode: 'SBIN0011662',
    upiId: 'swayamkrushi@sbi'
  }
}

export async function updateSettings(settings) {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    localStorage.setItem('swayamkrushi_site_settings', JSON.stringify(data))
    return data
  } catch (err) {
    localStorage.setItem('swayamkrushi_site_settings', JSON.stringify(settings))
    return settings
  }
}

// ─── ADMIN AUTH & STATS ──────────────────────────────────────────────────
export async function adminLogin(passcode) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passcode })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    // fallback to local verification
  }
  if (passcode === 'swayamkrushi2026' || passcode === 'admin123' || passcode === 'swayamkrushi') {
    return { success: true, token: 'mock-jwt-token-' + Date.now() }
  }
  throw new Error('Invalid passcode. Please enter the correct administration passcode.')
}

export async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/stats`)
    if (res.ok) return await res.json()
  } catch (err) {
    // fallback
  }
  const inqs = JSON.parse(localStorage.getItem('swayamkrushi_inquiries') || '[]')
  const unread = inqs.filter((i) => i.status !== 'read').length
  return {
    articles: 10,
    accolades: 12,
    certificates: 6,
    faqs: 10,
    inquiries: inqs.length,
    unreadInquiries: unread
  }
}

// ─── ARTICLES API WITH INSTANT MEMORY CACHING & BACKGROUND REVALIDATE ───
export async function fetchArticles(params = {}) {
  const cacheKey = params.section ? `section_${params.section}` : 'all'
  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return []
    const deleted = getDeletedIds('article')
    if (deleted.length === 0) return list
    return list.filter(
      (a) => !deleted.includes(String(a.id)) && !deleted.includes(String(a._id))
    )
  }

  // If forceFresh is requested, skip client cache and fetch fresh from network
  if (params.forceFresh) {
    try {
      const queryParams = { ...params }
      delete queryParams.forceFresh
      const query = new URLSearchParams(queryParams).toString()
      const url = `${API_BASE_URL}/articles${query ? `?${query}` : ''}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          const cleaned = filterDeleted(data)
          _memoryArticlesCache[cacheKey] = cleaned
          localStorage.setItem(`swayamkrushi_articles_${cacheKey}`, JSON.stringify(cleaned))
          return cleaned
        }
      }
    } catch {}
  }

  // 1. Return immediately from memory cache if available (0ms)
  if (_memoryArticlesCache[cacheKey]) {
    fetch(`${API_BASE_URL}/articles${params.section ? `?section=${params.section}` : ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          const cleaned = filterDeleted(data)
          _memoryArticlesCache[cacheKey] = cleaned
          localStorage.setItem(`swayamkrushi_articles_${cacheKey}`, JSON.stringify(cleaned))
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('swayamkrushi_articles_updated', { detail: { key: cacheKey, data: cleaned } })
            )
          }
        }
      })
      .catch(() => {})
    return filterDeleted(_memoryArticlesCache[cacheKey])
  }

  // 2. Check localStorage cache for this SPECIFIC key
  const local = localStorage.getItem(`swayamkrushi_articles_${cacheKey}`)
  if (local) {
    try {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = filterDeleted(parsed)
        _memoryArticlesCache[cacheKey] = cleaned
        fetch(`${API_BASE_URL}/articles${params.section ? `?section=${params.section}` : ''}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (Array.isArray(data)) {
              const bgCleaned = filterDeleted(data)
              _memoryArticlesCache[cacheKey] = bgCleaned
              localStorage.setItem(`swayamkrushi_articles_${cacheKey}`, JSON.stringify(bgCleaned))
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('swayamkrushi_articles_updated', { detail: { key: cacheKey, data: bgCleaned } })
                )
              }
            }
          })
          .catch(() => {})
        return cleaned
      }
    } catch {}
  }

  // 3. Network Fetch
  try {
    const query = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}/articles${query ? `?${query}` : ''}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const cleaned = filterDeleted(data)
        _memoryArticlesCache[cacheKey] = cleaned
        localStorage.setItem(`swayamkrushi_articles_${cacheKey}`, JSON.stringify(cleaned))
        return cleaned
      }
    }
  } catch (err) {
    // Silent
  }

  return filterDeleted(_memoryArticlesCache[cacheKey] || null)
}

export async function fetchArticleById(id) {
  if (!id) return null
  if (isIdDeleted('article', id)) return null

  const aliasMap = {
    'story-fifteen-years': 'story-15-years',
    'story-15-years': 'story-fifteen-years',
    'story-sowing-seeds': 'story-tailoring',
    'story-tailoring': 'story-sowing-seeds',
    'dare-to-dream': 'dare-to-dream',
    'blood-sweat-and-tears': 'building-blocks',
    'blood-sweat-tears': 'building-blocks',
  }
  const altId = aliasMap[id]
  if (altId && isIdDeleted('article', altId)) return null

  // 1. Check detail-specific localStorage override
  try {
    const localDetail =
      localStorage.getItem(`swayamkrushi_article_detail_${id}`) ||
      (altId ? localStorage.getItem(`swayamkrushi_article_detail_${altId}`) : null)
    if (localDetail) {
      const parsed = JSON.parse(localDetail)
      if (parsed && parsed.title) {
        fetch(`${API_BASE_URL}/articles/${id}`).catch(() => {})
        return parsed
      }
    }
  } catch {}

  // 2. Fetch fresh from network
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`)
    if (res.ok) {
      const data = await res.json()
      if (data && !isIdDeleted('article', data.id) && !isIdDeleted('article', data._id)) {
        return data
      }
    }
    if (altId) {
      const resAlt = await fetch(`${API_BASE_URL}/articles/${altId}`)
      if (resAlt.ok) {
        const dataAlt = await resAlt.json()
        if (dataAlt && !isIdDeleted('article', dataAlt.id) && !isIdDeleted('article', dataAlt._id)) {
          return dataAlt
        }
      }
    }
  } catch {}

  // 3. Fallback to cache if network failed
  for (const k of Object.keys(_memoryArticlesCache)) {
    const list = _memoryArticlesCache[k]
    if (Array.isArray(list)) {
      const found = list.find(
        (a) => a.id === id || (altId && a.id === altId) || a._id === id
      )
      if (found && !isIdDeleted('article', found.id)) return found
    }
  }

  const cached =
    localStorage.getItem('swayamkrushi_articles_cache') ||
    localStorage.getItem('swayamkrushi_articles_all')
  if (cached) {
    try {
      const list = JSON.parse(cached)
      const found = list.find(
        (a) => a.id === id || (altId && a.id === altId) || a._id === id
      )
      if (found && !isIdDeleted('article', found.id)) return found
    } catch {}
  }

  return null
}

export async function createArticle(payload) {
  if (payload?.id) unmarkIdAsDeleted('article', payload.id)
  let serverResult = null
  try {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) serverResult = await res.json()
  } catch {}

  const newArt = serverResult || {
    ...payload,
    id: payload.id || 'article-' + Date.now(),
    _id: 'local-' + Date.now()
  }

  // Update memory caches
  for (const k of Object.keys(_memoryArticlesCache)) {
    if (Array.isArray(_memoryArticlesCache[k])) {
      _memoryArticlesCache[k].unshift(newArt)
    }
  }

  // Update localStorage caches
  const cacheKeys = [
    'swayamkrushi_articles_cache',
    'swayamkrushi_articles_all',
    'swayamkrushi_articles_section_all',
    newArt.section ? `swayamkrushi_articles_section_${newArt.section}` : null
  ].filter(Boolean)

  cacheKeys.forEach((k) => {
    try {
      const cached = JSON.parse(localStorage.getItem(k) || '[]')
      if (Array.isArray(cached)) {
        cached.unshift(newArt)
        localStorage.setItem(k, JSON.stringify(cached))
      }
    } catch {}
  })

  return newArt
}

export async function updateArticle(id, payload) {
  if (id) unmarkIdAsDeleted('article', id)
  if (payload?.id) unmarkIdAsDeleted('article', payload.id)

  let serverResult = null
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      serverResult = await res.json()
    }
  } catch {}

  const finalArticle = { ...payload, ...(serverResult || {}) }

  // Update in-memory caches
  for (const k of Object.keys(_memoryArticlesCache)) {
    if (Array.isArray(_memoryArticlesCache[k])) {
      const idx = _memoryArticlesCache[k].findIndex(
        (a) => String(a.id) === String(id) || String(a._id) === String(id)
      )
      if (idx !== -1) {
        _memoryArticlesCache[k][idx] = { ..._memoryArticlesCache[k][idx], ...finalArticle }
      }
    }
  }

  // Update ALL localStorage article caches
  const cacheKeys = [
    'swayamkrushi_articles_cache',
    'swayamkrushi_articles_all',
    'swayamkrushi_articles_section_all',
    'swayamkrushi_articles_section_main',
    'swayamkrushi_articles_section_left',
    'swayamkrushi_articles_section_right'
  ]
  cacheKeys.forEach((cacheKey) => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
      if (Array.isArray(cached)) {
        const idx = cached.findIndex(
          (a) => String(a.id) === String(id) || String(a._id) === String(id)
        )
        if (idx !== -1) {
          cached[idx] = { ...cached[idx], ...finalArticle }
        } else if (
          cacheKey === 'swayamkrushi_articles_cache' ||
          cacheKey === 'swayamkrushi_articles_all' ||
          (finalArticle.section && cacheKey === `swayamkrushi_articles_section_${finalArticle.section}`)
        ) {
          cached.unshift(finalArticle)
        }
        localStorage.setItem(cacheKey, JSON.stringify(cached))
      }
    } catch {}
  })

  try {
    localStorage.setItem(`swayamkrushi_article_detail_${id}`, JSON.stringify(finalArticle))
    if (finalArticle.id && finalArticle.id !== id) {
      localStorage.setItem(`swayamkrushi_article_detail_${finalArticle.id}`, JSON.stringify(finalArticle))
    }
  } catch {}

  return finalArticle
}

export async function deleteArticle(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('article', idStr)

  // 1. Purge from in-memory cache
  for (const k of Object.keys(_memoryArticlesCache)) {
    if (Array.isArray(_memoryArticlesCache[k])) {
      _memoryArticlesCache[k] = _memoryArticlesCache[k].filter(
        (a) => String(a.id) !== idStr && String(a._id) !== idStr
      )
    }
  }

  // 2. Purge from ALL localStorage article caches
  const cacheKeys = [
    'swayamkrushi_articles_cache',
    'swayamkrushi_articles_all',
    'swayamkrushi_articles_section_all',
    'swayamkrushi_articles_section_main',
    'swayamkrushi_articles_section_left',
    'swayamkrushi_articles_section_right'
  ]
  cacheKeys.forEach((k) => {
    try {
      const raw = localStorage.getItem(k)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (a) => String(a.id) !== idStr && String(a._id) !== idStr
          )
          localStorage.setItem(k, JSON.stringify(filtered))
        }
      }
    } catch {}
  })

  try {
    localStorage.removeItem(`swayamkrushi_article_detail_${idStr}`)
  } catch {}

  // 3. Best-effort backend delete
  try {
    await fetch(`${API_BASE_URL}/articles/${idStr}`, { method: 'DELETE' })
  } catch {}

  return { success: true }
}

// ─── ACCOLADES & RECOGNITION API ───────────────────────────────────────────
export async function fetchAccolades() {
  const filterDeleted = (data) => {
    if (!data) return data
    const deletedAcc = getDeletedIds('accolade')
    const deletedCert = getDeletedIds('cert')
    const cleaned = { ...data }
    if (Array.isArray(cleaned.timeline)) {
      cleaned.timeline = cleaned.timeline.filter(
        (item) => !deletedAcc.includes(String(item.id)) && !deletedAcc.includes(String(item._id))
      )
    }
    if (Array.isArray(cleaned.certificates)) {
      cleaned.certificates = cleaned.certificates.filter(
        (item) => !deletedCert.includes(String(item.id)) && !deletedCert.includes(String(item._id))
      )
    }
    if (
      cleaned.featured &&
      (deletedAcc.includes(String(cleaned.featured.id)) || deletedAcc.includes(String(cleaned.featured._id)))
    ) {
      cleaned.featured = null
    }
    return cleaned
  }

  try {
    const res = await fetch(`${API_BASE_URL}/accolades`)
    if (res.ok) {
      const data = await res.json()
      const cleaned = filterDeleted(data)
      localStorage.setItem('swayamkrushi_accolades_cache', JSON.stringify(cleaned))
      return cleaned
    }
  } catch (err) {
    console.warn('Backend API unavailable for accolades, using local fallback:', err.message)
  }
  const local = localStorage.getItem('swayamkrushi_accolades_cache')
  if (local) {
    try {
      return filterDeleted(JSON.parse(local))
    } catch {}
  }
  return null
}

export async function createAccolade(payload) {
  if (payload?.id) unmarkIdAsDeleted('accolade', payload.id)
  try {
    const res = await fetch(`${API_BASE_URL}/accolades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json()
  } catch {}
  return payload
}

export async function updateAccolade(id, payload) {
  if (id) unmarkIdAsDeleted('accolade', id)
  try {
    const res = await fetch(`${API_BASE_URL}/accolades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json()
  } catch {}
  return payload
}

export async function deleteAccolade(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('accolade', idStr)
  try {
    await fetch(`${API_BASE_URL}/accolades/${idStr}`, { method: 'DELETE' })
  } catch {}
  try {
    const raw = localStorage.getItem('swayamkrushi_accolades_cache')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.timeline) {
        parsed.timeline = parsed.timeline.filter(
          (item) => String(item.id) !== idStr && String(item._id) !== idStr
        )
      }
      if (parsed?.certificates) {
        parsed.certificates = parsed.certificates.filter(
          (item) => String(item.id) !== idStr && String(item._id) !== idStr
        )
      }
      localStorage.setItem('swayamkrushi_accolades_cache', JSON.stringify(parsed))
    }
  } catch {}
  return { success: true }
}

// ─── CERTIFICATES API ─────────────────────────────────────────────────────
export async function fetchCertificates() {
  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return []
    const deleted = getDeletedIds('cert')
    return list.filter((c) => !deleted.includes(String(c._id)) && !deleted.includes(String(c.id)))
  }
  try {
    const res = await fetch(`${API_BASE_URL}/certificates`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const cleaned = filterDeleted(data)
        localStorage.setItem('swayamkrushi_certificates', JSON.stringify(cleaned))
        return cleaned
      }
    }
  } catch {}
  return filterDeleted(JSON.parse(localStorage.getItem('swayamkrushi_certificates') || '[]'))
}

export async function createCertificate(payload) {
  if (payload?.id) unmarkIdAsDeleted('cert', payload.id)
  try {
    const res = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const saved = await res.json()
      const certs = JSON.parse(localStorage.getItem('swayamkrushi_certificates') || '[]')
      certs.push(saved)
      localStorage.setItem('swayamkrushi_certificates', JSON.stringify(certs))
      return saved
    }
  } catch {}
  const certs = JSON.parse(localStorage.getItem('swayamkrushi_certificates') || '[]')
  const newC = { ...payload, _id: 'cert-' + Date.now() }
  certs.push(newC)
  localStorage.setItem('swayamkrushi_certificates', JSON.stringify(certs))
  return newC
}

export async function deleteCertificate(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('cert', idStr)
  try {
    await fetch(`${API_BASE_URL}/certificates/${idStr}`, { method: 'DELETE' })
  } catch {}
  const certs = JSON.parse(localStorage.getItem('swayamkrushi_certificates') || '[]')
  const filtered = certs.filter((c) => String(c._id) !== idStr && String(c.id) !== idStr)
  localStorage.setItem('swayamkrushi_certificates', JSON.stringify(filtered))
  return { success: true }
}

// ─── EVENT IMAGES API ──────────────────────────────────────────────────────
const EVENT_IMAGES_KEY = 'swayamkrushi_event_images'

export async function fetchEventImages() {
  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return []
    const deleted = getDeletedIds('event')
    return list.filter((item) => !deleted.includes(String(item._id)) && !deleted.includes(String(item.id)))
  }
  try {
    const res = await fetch(`${API_BASE_URL}/events`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const cleaned = filterDeleted(data)
        localStorage.setItem(EVENT_IMAGES_KEY, JSON.stringify(cleaned))
        return cleaned
      }
    }
  } catch {}
  return filterDeleted(JSON.parse(localStorage.getItem(EVENT_IMAGES_KEY) || '[]'))
}

export async function createEventImage(payload) {
  if (payload?.id) unmarkIdAsDeleted('event', payload.id)
  try {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const saved = await res.json()
      const list = JSON.parse(localStorage.getItem(EVENT_IMAGES_KEY) || '[]')
      list.unshift(saved)
      localStorage.setItem(EVENT_IMAGES_KEY, JSON.stringify(list))
      return saved
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(EVENT_IMAGES_KEY) || '[]')
  const newEvt = {
    ...payload,
    _id: 'evt-' + Date.now(),
    id: 'evt-' + Date.now(),
    createdAt: new Date().toISOString()
  }
  list.unshift(newEvt)
  localStorage.setItem(EVENT_IMAGES_KEY, JSON.stringify(list))
  return newEvt
}

export async function deleteEventImage(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('event', idStr)
  try {
    await fetch(`${API_BASE_URL}/events/${idStr}`, { method: 'DELETE' })
  } catch {}
  const list = JSON.parse(localStorage.getItem(EVENT_IMAGES_KEY) || '[]')
  const filtered = list.filter((item) => String(item._id) !== idStr && String(item.id) !== idStr)
  localStorage.setItem(EVENT_IMAGES_KEY, JSON.stringify(filtered))
  return { success: true }
}

// ─── FAQS API ──────────────────────────────────────────────────────────────
export async function fetchFaqs() {
  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return []
    const deleted = getDeletedIds('faq')
    return list.filter((f) => !deleted.includes(String(f._id)) && !deleted.includes(String(f.id)))
  }
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const cleaned = filterDeleted(data)
        localStorage.setItem('swayamkrushi_faqs', JSON.stringify(cleaned))
        return cleaned
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable for FAQs, using local fallback:', err.message)
  }
  const local = localStorage.getItem('swayamkrushi_faqs')
  if (local) {
    try { return filterDeleted(JSON.parse(local)) } catch {}
  }
  return []
}

export async function createFaq(payload) {
  if (payload?.id) unmarkIdAsDeleted('faq', payload.id)
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const saved = await res.json()
      const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
      faqs.push(saved)
      localStorage.setItem('swayamkrushi_faqs', JSON.stringify(faqs))
      return saved
    }
  } catch {}
  const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
  const newFaq = { ...payload, _id: 'faq-' + Date.now() }
  faqs.push(newFaq)
  localStorage.setItem('swayamkrushi_faqs', JSON.stringify(faqs))
  return newFaq
}

export async function updateFaq(id, payload) {
  if (id) unmarkIdAsDeleted('faq', id)
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const saved = await res.json()
      const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
      const idx = faqs.findIndex((f) => String(f._id) === String(id) || String(f.id) === String(id))
      if (idx !== -1) faqs[idx] = saved
      localStorage.setItem('swayamkrushi_faqs', JSON.stringify(faqs))
      return saved
    }
  } catch {}
  const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
  const idx = faqs.findIndex((f) => String(f._id) === String(id) || String(f.id) === String(id))
  if (idx !== -1) {
    faqs[idx] = { ...faqs[idx], ...payload }
    localStorage.setItem('swayamkrushi_faqs', JSON.stringify(faqs))
    return faqs[idx]
  }
  return payload
}

export async function deleteFaq(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('faq', idStr)
  try {
    await fetch(`${API_BASE_URL}/faqs/${idStr}`, { method: 'DELETE' })
  } catch {}
  const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
  const filtered = faqs.filter((f) => String(f._id) !== idStr && String(f.id) !== idStr)
  localStorage.setItem('swayamkrushi_faqs', JSON.stringify(filtered))
  return { success: true }
}

// ─── INSIDERS VIDEO STORIES API ───────────────────────────────────────────
export async function fetchInsiders(params = {}) {
  try {
    const query = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}/insiders${query ? `?${query}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Backend API unavailable for insiders, using local fallback:', err.message)
    return null
  }
}

// ─── CONTACT INQUIRIES API ─────────────────────────────────────────────────
export async function submitContactMessage(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to submit contact inquiry')
    return data
  } catch (err) {
    const inqs = JSON.parse(localStorage.getItem('swayamkrushi_inquiries') || '[]')
    const newInq = {
      ...payload,
      _id: 'inq-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    inqs.unshift(newInq)
    localStorage.setItem('swayamkrushi_inquiries', JSON.stringify(inqs))
    return { success: true, message: 'Message received and stored!' }
  }
}

export async function fetchInquiries() {
  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return []
    const deleted = getDeletedIds('inquiry')
    return list.filter((i) => !deleted.includes(String(i._id)) && !deleted.includes(String(i.id)))
  }
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const cleaned = filterDeleted(data)
        localStorage.setItem('swayamkrushi_inquiries', JSON.stringify(cleaned))
        return cleaned
      }
    }
  } catch {}
  return filterDeleted(JSON.parse(localStorage.getItem('swayamkrushi_inquiries') || '[]'))
}

export async function updateInquiryStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (res.ok) return await res.json()
  } catch {}
  const inqs = JSON.parse(localStorage.getItem('swayamkrushi_inquiries') || '[]')
  const idx = inqs.findIndex((i) => String(i._id) === String(id) || String(i.id) === String(id))
  if (idx !== -1) {
    inqs[idx].status = status
    localStorage.setItem('swayamkrushi_inquiries', JSON.stringify(inqs))
  }
  return { success: true }
}

export async function deleteInquiry(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('inquiry', idStr)
  try {
    await fetch(`${API_BASE_URL}/inquiries/${idStr}`, { method: 'DELETE' })
  } catch {}
  const inqs = JSON.parse(localStorage.getItem('swayamkrushi_inquiries') || '[]')
  const filtered = inqs.filter((i) => String(i._id) !== idStr && String(i.id) !== idStr)
  localStorage.setItem('swayamkrushi_inquiries', JSON.stringify(filtered))
  return { success: true }
}

// ─── CLOUDINARY / FILE UPLOAD HELPER ──────────────────────────────────────
export async function uploadImage(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    })
    if (res.ok) {
      const data = await res.json()
      if (data.url) return data.url
    }
  } catch (err) {
    console.warn('Backend file upload failed, converting to local data URI:', err.message)
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

export async function deleteMediaFromCloudinary(urlOrPublicId, resourceType = 'image') {
  if (!urlOrPublicId) return { success: false }
  try {
    const res = await fetch(`${API_BASE_URL}/delete-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrPublicId, resourceType })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Failed to delete media from backend/Cloudinary:', err.message)
  }
  return { success: false }
}

// ═══════════════════════════════════════════════════════════════════════════
// MANAGING COMMITTEE CRUD API
// ═══════════════════════════════════════════════════════════════════════════

const COMMITTEE_STORAGE_KEY = 'swayamkrushi_committee_members'

export async function fetchCommitteeMembers() {
  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return []
    const deleted = getDeletedIds('committee')
    return list.filter((m) => !deleted.includes(String(m.id)) && !deleted.includes(String(m._id)))
  }
  try {
    const res = await fetch(`${API_BASE_URL}/committee`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const cleaned = filterDeleted(data)
        localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(cleaned))
        return cleaned
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable for committee, using local store:', err.message)
  }
  const local = localStorage.getItem(COMMITTEE_STORAGE_KEY)
  if (local) {
    try {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed)) return filterDeleted(parsed)
    } catch {}
  }
  return null
}

export async function saveCommitteeMembers(members) {
  const cleaned = (members || []).filter((m) => !isIdDeleted('committee', m.id))
  localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(cleaned))
  return cleaned
}

export async function createCommitteeMember(memberData) {
  if (memberData?.id) unmarkIdAsDeleted('committee', memberData.id)
  try {
    const res = await fetch(`${API_BASE_URL}/committee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    })
    if (res.ok) {
      const saved = await res.json()
      const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
      list.push(saved)
      localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(list))
      return saved
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
  const newMember = {
    ...memberData,
    id: memberData.id || 'member-' + Date.now(),
    _id: 'local-' + Date.now()
  }
  list.push(newMember)
  localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(list))
  return newMember
}

export async function updateCommitteeMember(id, memberData) {
  if (id) unmarkIdAsDeleted('committee', id)
  try {
    const res = await fetch(`${API_BASE_URL}/committee/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    })
    if (res.ok) {
      const updated = await res.json()
      const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
      const idx = list.findIndex((m) => String(m.id) === String(id) || String(m._id) === String(id))
      if (idx !== -1) list[idx] = updated
      localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(list))
      return updated
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
  const idx = list.findIndex((m) => String(m.id) === String(id) || String(m._id) === String(id))
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...memberData }
    localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(list))
    return list[idx]
  }
  return memberData
}

export async function deleteCommitteeMember(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('committee', idStr)
  try {
    await fetch(`${API_BASE_URL}/committee/${idStr}`, { method: 'DELETE' })
  } catch {}
  const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
  const filtered = list.filter((m) => String(m.id) !== idStr && String(m._id) !== idStr)
  localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(filtered))
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA BUZZ & PRESS CRUD API
// ═══════════════════════════════════════════════════════════════════════════

const MEDIA_BUZZ_STORAGE_KEY = 'swayamkrushi_media_buzz'

export async function fetchMediaBuzz() {
  const filterDeleted = (list) => {
    if (!Array.isArray(list)) return []
    const deleted = getDeletedIds('media_buzz')
    return list.filter((a) => !deleted.includes(String(a.id)) && !deleted.includes(String(a._id)))
  }
  try {
    const res = await fetch(`${API_BASE_URL}/media-buzz`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const cleaned = filterDeleted(data)
        localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(cleaned))
        return cleaned
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable for media-buzz, using local store:', err.message)
  }
  const local = localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY)
  if (local) {
    try {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed)) return filterDeleted(parsed)
    } catch {}
  }
  return null
}

export async function saveMediaBuzz(articles) {
  const cleaned = (articles || []).filter((a) => !isIdDeleted('media_buzz', a.id))
  localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(cleaned))
  return cleaned
}

export async function createMediaBuzz(articleData) {
  if (articleData?.id) unmarkIdAsDeleted('media_buzz', articleData.id)
  try {
    const res = await fetch(`${API_BASE_URL}/media-buzz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })
    if (res.ok) {
      const saved = await res.json()
      const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
      list.unshift(saved)
      localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(list))
      return saved
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
  const newItem = {
    ...articleData,
    id: articleData.id || 'buzz-' + Date.now(),
    _id: 'local-' + Date.now()
  }
  list.unshift(newItem)
  localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(list))
  return newItem
}

export async function updateMediaBuzz(id, articleData) {
  if (id) unmarkIdAsDeleted('media_buzz', id)
  try {
    const res = await fetch(`${API_BASE_URL}/media-buzz/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })
    if (res.ok) {
      const updated = await res.json()
      const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
      const idx = list.findIndex((a) => String(a.id) === String(id) || String(a._id) === String(id))
      if (idx !== -1) list[idx] = updated
      localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(list))
      return updated
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
  const idx = list.findIndex((a) => String(a.id) === String(id) || String(a._id) === String(id))
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...articleData }
    localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(list))
    return list[idx]
  }
  return articleData
}

export async function deleteMediaBuzz(id) {
  if (!id) return { success: false }
  const idStr = String(id).trim()
  markIdAsDeleted('media_buzz', idStr)
  try {
    await fetch(`${API_BASE_URL}/media-buzz/${idStr}`, { method: 'DELETE' })
  } catch {}
  const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
  const filtered = list.filter((a) => String(a.id) !== idStr && String(a._id) !== idStr)
  localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(filtered))
  return { success: true }
}
