// Frontend API Service for Swayamkrushi Backend (MongoDB + Cloudinary)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
  const res = await fetch(`${API_BASE_URL}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, source: 'website_footer' })
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to subscribe')
  }
  return data
}

// ─── CMS & SITE SETTINGS ─────────────────────────────────────────────────
export async function fetchSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Using default site settings fallback:', err.message)
    return {
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
}

// ─── ARTICLES API ──────────────────────────────────────────────────────────
export async function fetchArticles(params = {}) {
  try {
    const query = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}/articles${query ? `?${query}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Backend API unavailable, using local articles data fallback:', err.message)
    return null
  }
}

export async function fetchArticleById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`Backend API unavailable for article ${id}, using local fallback:`, err.message)
    return null
  }
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

// ─── FAQS API ──────────────────────────────────────────────────────────────
export async function fetchFaqs() {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Backend API unavailable for FAQs, using local fallback:', err.message)
    return null
  }
}

// ─── INSIDERS VIDEO STORIES & TESTIMONIALS API ───────────────────────────
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

// ─── CONTACT SUBMISSION ────────────────────────────────────────────────────
export async function submitContactMessage(payload) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit contact inquiry')
  }
  return data
}
