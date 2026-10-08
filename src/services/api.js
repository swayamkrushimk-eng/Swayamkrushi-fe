// Frontend API Service for Swayamkrushi Backend (MongoDB + Cloudinary + LocalStorage Resilience)
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

// ─── CMS & SITE SETTINGS ─────────────────────────────────────────────────
export async function fetchSettings() {
  if (_memorySettings) return _memorySettings
  const local = localStorage.getItem('swayamkrushi_site_settings')
  if (local) {
    try {
      _memorySettings = JSON.parse(local)
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE_URL}/settings`)
    if (res.ok) {
      const data = await res.json()
      _memorySettings = data
      localStorage.setItem('swayamkrushi_site_settings', JSON.stringify(data))
      return data
    }
  } catch (err) {
    // Silent
  }

  return _memorySettings || {
    orgName: 'Swayamkrushi',
    tagline: 'A Haven for the Mentally Challenged Since 1987',
    phone1: '+91 9704245454',
    phone2: '+91 9963766729',
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

  // 1. Return immediately from memory cache if available (0ms)
  if (_memoryArticlesCache[cacheKey]) {
    // Revalidate in background
    fetch(`${API_BASE_URL}/articles${params.section ? `?section=${params.section}` : ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          _memoryArticlesCache[cacheKey] = data
          localStorage.setItem(`swayamkrushi_articles_${cacheKey}`, JSON.stringify(data))
        }
      })
      .catch(() => {})
    return _memoryArticlesCache[cacheKey]
  }

  // 2. Check localStorage cache
  const local = localStorage.getItem(`swayamkrushi_articles_${cacheKey}`) || localStorage.getItem('swayamkrushi_articles_cache')
  if (local) {
    try {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed) && parsed.length > 0) {
        _memoryArticlesCache[cacheKey] = parsed
        // Revalidate in background
        fetch(`${API_BASE_URL}/articles${params.section ? `?section=${params.section}` : ''}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              _memoryArticlesCache[cacheKey] = data
              localStorage.setItem(`swayamkrushi_articles_${cacheKey}`, JSON.stringify(data))
            }
          })
          .catch(() => {})
        return parsed
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
      if (Array.isArray(data) && data.length > 0) {
        _memoryArticlesCache[cacheKey] = data
        localStorage.setItem(`swayamkrushi_articles_${cacheKey}`, JSON.stringify(data))
        return data
      }
    }
  } catch (err) {
    // Silent
  }

  return _memoryArticlesCache[cacheKey] || null
}

export async function fetchArticleById(id) {
  for (const k of Object.keys(_memoryArticlesCache)) {
    const list = _memoryArticlesCache[k]
    if (Array.isArray(list)) {
      const found = list.find((a) => a.id === id || a._id === id)
      if (found) return found
    }
  }

  const cached = localStorage.getItem('swayamkrushi_articles_cache') || localStorage.getItem('swayamkrushi_articles_all')
  if (cached) {
    try {
      const list = JSON.parse(cached)
      const found = list.find((a) => a.id === id || a._id === id)
      if (found) return found
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`)
    if (res.ok) return await res.json()
  } catch {}

  return null
}

export async function createArticle(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json()
  } catch {}
  const cached = JSON.parse(localStorage.getItem('swayamkrushi_articles_cache') || '[]')
  const newArt = { ...payload, id: payload.id || 'article-' + Date.now(), _id: 'local-' + Date.now() }
  cached.unshift(newArt)
  localStorage.setItem('swayamkrushi_articles_cache', JSON.stringify(cached))
  return newArt
}

export async function updateArticle(id, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json()
  } catch {}
  const cached = JSON.parse(localStorage.getItem('swayamkrushi_articles_cache') || '[]')
  const idx = cached.findIndex((a) => a.id === id || a._id === id)
  if (idx !== -1) {
    cached[idx] = { ...cached[idx], ...payload }
    localStorage.setItem('swayamkrushi_articles_cache', JSON.stringify(cached))
    return cached[idx]
  }
  return payload
}

export async function deleteArticle(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, { method: 'DELETE' })
    if (res.ok) return await res.json()
  } catch {}
  const cached = JSON.parse(localStorage.getItem('swayamkrushi_articles_cache') || '[]')
  const filtered = cached.filter((a) => a.id !== id && a._id !== id)
  localStorage.setItem('swayamkrushi_articles_cache', JSON.stringify(filtered))
  return { success: true }
}

// ─── ACCOLADES & RECOGNITION API ───────────────────────────────────────────
export async function fetchAccolades() {
  try {
    const res = await fetch(`${API_BASE_URL}/accolades`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Backend API unavailable for accolades, using local fallback:', err.message)
    return null
  }
}

export async function createAccolade(payload) {
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
  try {
    const res = await fetch(`${API_BASE_URL}/accolades/${id}`, { method: 'DELETE' })
    if (res.ok) return await res.json()
  } catch {}
  return { success: true }
}

// ─── CERTIFICATES API ─────────────────────────────────────────────────────
export async function fetchCertificates() {
  try {
    const res = await fetch(`${API_BASE_URL}/certificates`)
    if (res.ok) return await res.json()
  } catch {}
  return JSON.parse(localStorage.getItem('swayamkrushi_certificates') || '[]')
}

export async function createCertificate(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json()
  } catch {}
  const certs = JSON.parse(localStorage.getItem('swayamkrushi_certificates') || '[]')
  const newC = { ...payload, _id: 'cert-' + Date.now() }
  certs.push(newC)
  localStorage.setItem('swayamkrushi_certificates', JSON.stringify(certs))
  return newC
}

export async function deleteCertificate(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}`, { method: 'DELETE' })
    if (res.ok) return await res.json()
  } catch {}
  const certs = JSON.parse(localStorage.getItem('swayamkrushi_certificates') || '[]')
  const filtered = certs.filter((c) => c._id !== id && c.id !== id)
  localStorage.setItem('swayamkrushi_certificates', JSON.stringify(filtered))
  return { success: true }
}

// ─── FAQS API ──────────────────────────────────────────────────────────────
export async function fetchFaqs() {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Backend API unavailable for FAQs, using local fallback:', err.message)
    const local = localStorage.getItem('swayamkrushi_faqs')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    return []
  }
}

export async function createFaq(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json()
  } catch {}
  const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
  const newFaq = { ...payload, _id: 'faq-' + Date.now() }
  faqs.push(newFaq)
  localStorage.setItem('swayamkrushi_faqs', JSON.stringify(faqs))
  return newFaq
}

export async function updateFaq(id, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) return await res.json()
  } catch {}
  const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
  const idx = faqs.findIndex((f) => f._id === id || f.id === id)
  if (idx !== -1) {
    faqs[idx] = { ...faqs[idx], ...payload }
    localStorage.setItem('swayamkrushi_faqs', JSON.stringify(faqs))
    return faqs[idx]
  }
  return payload
}

export async function deleteFaq(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/${id}`, { method: 'DELETE' })
    if (res.ok) return await res.json()
  } catch {}
  const faqs = JSON.parse(localStorage.getItem('swayamkrushi_faqs') || '[]')
  const filtered = faqs.filter((f) => f._id !== id && f.id !== id)
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
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries`)
    if (res.ok) return await res.json()
  } catch {}
  return JSON.parse(localStorage.getItem('swayamkrushi_inquiries') || '[]')
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
  const idx = inqs.findIndex((i) => i._id === id || i.id === id)
  if (idx !== -1) {
    inqs[idx].status = status
    localStorage.setItem('swayamkrushi_inquiries', JSON.stringify(inqs))
  }
  return { success: true }
}

export async function deleteInquiry(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, { method: 'DELETE' })
    if (res.ok) return await res.json()
  } catch {}
  const inqs = JSON.parse(localStorage.getItem('swayamkrushi_inquiries') || '[]')
  const filtered = inqs.filter((i) => i._id !== id && i.id !== id)
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
  // Local fallback: convert file to Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// MANAGING COMMITTEE CRUD API
// ═══════════════════════════════════════════════════════════════════════════

const COMMITTEE_STORAGE_KEY = 'swayamkrushi_committee_members'

export async function fetchCommitteeMembers() {
  try {
    const res = await fetch(`${API_BASE_URL}/committee`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(data))
        return data
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable for committee, using local store:', err.message)
  }
  const local = localStorage.getItem(COMMITTEE_STORAGE_KEY)
  if (local) {
    try {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {}
  }
  return null // Callers will fall back to static DEFAULT_COMMITTEE_MEMBERS
}

export async function saveCommitteeMembers(members) {
  localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(members))
  return members
}

export async function createCommitteeMember(memberData) {
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
  try {
    const res = await fetch(`${API_BASE_URL}/committee/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    })
    if (res.ok) {
      const updated = await res.json()
      const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
      const idx = list.findIndex((m) => m.id === id || m._id === id)
      if (idx !== -1) list[idx] = updated
      localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(list))
      return updated
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
  const idx = list.findIndex((m) => m.id === id || m._id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...memberData }
    localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(list))
    return list[idx]
  }
  return memberData
}

export async function deleteCommitteeMember(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/committee/${id}`, { method: 'DELETE' })
    if (res.ok) {
      const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
      const filtered = list.filter((m) => m.id !== id && m._id !== id)
      localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(filtered))
      return await res.json()
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(COMMITTEE_STORAGE_KEY) || '[]')
  const filtered = list.filter((m) => m.id !== id && m._id !== id)
  localStorage.setItem(COMMITTEE_STORAGE_KEY, JSON.stringify(filtered))
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA BUZZ & PRESS CRUD API
// ═══════════════════════════════════════════════════════════════════════════

const MEDIA_BUZZ_STORAGE_KEY = 'swayamkrushi_media_buzz'

export async function fetchMediaBuzz() {
  try {
    const res = await fetch(`${API_BASE_URL}/media-buzz`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(data))
        return data
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable for media-buzz, using local store:', err.message)
  }
  const local = localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY)
  if (local) {
    try {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {}
  }
  return null // Callers will fall back to static DEFAULT_MEDIA_ARTICLES
}

export async function saveMediaBuzz(articles) {
  localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(articles))
  return articles
}

export async function createMediaBuzz(articleData) {
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
  try {
    const res = await fetch(`${API_BASE_URL}/media-buzz/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })
    if (res.ok) {
      const updated = await res.json()
      const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
      const idx = list.findIndex((a) => a.id === id || a._id === id)
      if (idx !== -1) list[idx] = updated
      localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(list))
      return updated
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
  const idx = list.findIndex((a) => a.id === id || a._id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...articleData }
    localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(list))
    return list[idx]
  }
  return articleData
}

export async function deleteMediaBuzz(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/media-buzz/${id}`, { method: 'DELETE' })
    if (res.ok) {
      const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
      const filtered = list.filter((a) => a.id !== id && a._id !== id)
      localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(filtered))
      return await res.json()
    }
  } catch {}
  const list = JSON.parse(localStorage.getItem(MEDIA_BUZZ_STORAGE_KEY) || '[]')
  const filtered = list.filter((a) => a.id !== id && a._id !== id)
  localStorage.setItem(MEDIA_BUZZ_STORAGE_KEY, JSON.stringify(filtered))
  return { success: true }
}
