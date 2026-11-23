import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import { fetchMediaBuzz, isIdDeleted } from '../services/api'
import hinduClipping from '../assets/images/hindu-35-years-clipping.jpg'
import eenaduClipping from '../assets/images/eenadu-2026-10-10-clipping.jpg'
import andhraPrabhaClipping from '../assets/images/andhra-prabha-2026-10-10-clipping.jpg'
import andhraJyothyClipping from '../assets/images/andhra-jyothy-2026-10-10-clipping.jpg'
import aadabPurpleDayClipping from '../assets/images/aadab-hyderabad-purple-day-2026-03-27.jpg'
import nijamPurpleDayClipping from '../assets/images/nijam-cheputham-purple-day-2026-03-27.jpg'
import iviewPurpleDayClipping from '../assets/images/iview-news-purple-day-2026-03-27.jpg'
import andhraPrabhaPurpleDayClipping from '../assets/images/andhra-prabha-purple-day-2026-03-27.jpg'
import eenaduClipping20261117a from '../assets/images/telugu-clipping-2026-11-17-1.jpeg'
import eenaduClipping20261117b from '../assets/images/telugu-clipping-2026-11-17-2.jpeg'
import eenaduClipping20261117c from '../assets/images/telugu-clipping-2026-11-17-3.jpeg'
import sakshiClipping20261117 from '../assets/images/telugu-clipping-2026-11-17-4.jpeg'
import netramClipping20261117 from '../assets/images/telugu-clipping-2026-11-17-5.jpeg'
import './MediaBuzzPage.css'

const CLIPPING_IMAGE_BY_ID = {
  'hindu-35-years-milestone': hinduClipping,
  'eenadu-epaper-2026-10-10': eenaduClipping,
  'andhra-prabha-rangareddy-2026-10-10': andhraPrabhaClipping,
  'andhra-jyothy-uppal-malkajgiri-2026-10-10': andhraJyothyClipping,
  'aadab-hyderabad-purple-day-2026-03-27': aadabPurpleDayClipping,
  'nijam-cheputham-purple-day-2026-03-27': nijamPurpleDayClipping,
  'iview-news-purple-day-2026-03-27': iviewPurpleDayClipping,
  'andhra-prabha-purple-day-2026-03-27': andhraPrabhaPurpleDayClipping,
  'eenadu-clipping-abhinandaneeyam-2026-11-17': eenaduClipping20261117a,
  'eenadu-clipping-equal-opportunities-2026-11-17': eenaduClipping20261117b,
  'eenadu-clipping-rare-gift-2026-11-17': eenaduClipping20261117c,
  'sakshi-clipping-seethakka-2026-11-17': sakshiClipping20261117,
  'netram-clipping-venkaiah-2026-11-17': netramClipping20261117
}

const VIDEO_BY_ID = {
  'purple-day-epilepsy-awareness-video': '/media-buzz/purple-day-epilepsy-awareness-2026.mp4',
  'tv9-coral-jubilee-celebrations': '/media-buzz/tv9-coral-jubilee-celebrations.mp4',
  'brk-news-reporter-ramu': '/media-buzz/brk-news-reporter-ramu.mp4',
  'youtube-swatantra-tv-seethakka': 'https://www.youtube.com/watch?v=q7eGQKm59jc',
  'youtube-100-tv-seethakka': 'https://www.youtube.com/watch?v=0C-wA51-WJI',
  'youtube-abn-seethakka': 'https://www.youtube.com/watch?v=PWe1PCnOCdM',
  'youtube-etv-seethakka': 'https://www.youtube.com/watch?v=fqH8vlNlX9c'
}

/** Today's Coral Jubilee Media Buzz items (shown under the celebration heading). */
const CORAL_JUBILEE_IDS = new Set([
  'tv9-coral-jubilee-celebrations',
  'youtube-abn-seethakka',
  'youtube-etv-seethakka',
  'youtube-swatantra-tv-seethakka',
  'youtube-100-tv-seethakka',
  'youtube-dd-news-seethakka',
  'brk-news-reporter-ramu',
  'metro-india-epaper-2026-11-22',
  'fpj-mumbai-epaper-2026-11-22',
  'deccan-chronicle-epaper-2026-11-17',
  'hindu-former-vp-youth-social-initiatives-2026-11-16',
  'telangana-today-epaper-2026-11-17',
  'fpj-international-epaper-2026-11-17',
  'metro-india-epaper-2026-11-17',
  'eenadu-clipping-abhinandaneeyam-2026-11-17',
  'eenadu-clipping-equal-opportunities-2026-11-17',
  'eenadu-clipping-rare-gift-2026-11-17',
  'eenadu-online-equal-opportunities-2026-11-17',
  'sakshi-clipping-seethakka-2026-11-17',
  'mana-telangana-epaper-2026-11-17',
  'netram-clipping-venkaiah-2026-11-17'
])

function isCoralJubileeItem(article) {
  return CORAL_JUBILEE_IDS.has(article?.id)
}

/** Compact top-row media videos (YouTube + featured local clips). */
function isTopVideoCard(card) {
  if (card?._cardType !== 'video') return false
  if (isYouTubeVideo(card.video)) return true
  return (card.order || 0) >= 100
}

/** Extract YouTube video ID from watch / youtu.be / embed / shorts URLs. */
function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
    /^([A-Za-z0-9_-]{11})$/
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function getYouTubeEmbedUrl(url) {
  const id = getYouTubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

function getYouTubeWatchUrl(url) {
  const id = getYouTubeVideoId(url)
  return id ? `https://www.youtube.com/watch?v=${id}` : (url || '')
}

function getYouTubeThumbnailUrl(url) {
  const id = getYouTubeVideoId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

function isYouTubeVideo(url) {
  return Boolean(getYouTubeVideoId(url))
}

/** Publishers that block iframe embeds (show clickable thumbnail instead). */
const YOUTUBE_NO_EMBED_IDS = new Set([
  'fqH8vlNlX9c' // ETV Telangana — embed blocked by rights holder
])

function isYouTubeEmbedBlocked(url) {
  const id = getYouTubeVideoId(url)
  return Boolean(id && YOUTUBE_NO_EMBED_IDS.has(id))
}

function withClippingDefaults(article) {
  const fallbackImage = CLIPPING_IMAGE_BY_ID[article.id]
  const fallbackVideo = VIDEO_BY_ID[article.id]
  const dbImage = typeof article.image === 'string' ? article.image.trim() : (article.image || '')
  const dbVideo = typeof article.video === 'string' ? article.video.trim() : (article.video || '')
  // Prefer the bundled newspaper scan when available. DB entries sometimes store a broken
  // Cloudinary URL (or a video URL) after a failed/mis-typed upload.
  const looksUnusable =
    !dbImage ||
    /\.(mp4|webm|mov|m4v|mkv)(\?|$)/i.test(dbImage) ||
    dbImage.includes('/video/upload/') ||
    dbImage.includes('placeholder')
  const image = (!looksUnusable ? dbImage : '') || fallbackImage || ''
  const video = dbVideo || fallbackVideo || ''
  const isClipping = !!article.isClipping || !!fallbackImage
  return {
    ...article,
    image: image || null,
    video: video || null,
    isClipping
  }
}

const TELUGU_OUTLETS = [
  'mana telangana',
  'sakshi',
  'eenadu',
  'ninadam',
  'andhra prabha',
  'andhra jyothy',
  'aadab',
  'nijam',
  'iview',
  'netram'
]

function isTeluguArticle(article) {
  const text = [
    article.title,
    article.excerpt,
    article.readTime,
    article.category,
    article.badge,
    ...(Array.isArray(article.tags) ? article.tags : [])
  ]
    .filter(Boolean)
    .join(' ')

  if (/[\u0C00-\u0C7F]/.test(text)) return true
  if (/telugu/i.test(text)) return true

  const outlet = String(article.outlet || '').toLowerCase()
  return TELUGU_OUTLETS.some((name) => outlet.includes(name))
}

/**
 * Display order within a group:
 * 0) Videos first
 * 1) English paper/link cards
 * 2) English newspaper clipping images
 * 3) Telugu papers (links + clippings interleaved by order)
 * 4) Other local videos last
 */
function sortDisplayCards(cards) {
  const rank = (card) => {
    if (card._cardType === 'video') {
      return isTopVideoCard(card) || isCoralJubileeItem(card) ? -1 : 5
    }
    if (isTeluguArticle(card)) return 2
    if (card._cardType === 'image') return 1
    return 0
  }

  return [...cards].sort((a, b) => {
    const byGroup = rank(a) - rank(b)
    if (byGroup !== 0) return byGroup
    return (a.order || 0) - (b.order || 0)
  })
}

function splitJubileeAndArchive(cards) {
  const jubilee = []
  const archive = []
  cards.forEach((card) => {
    if (isCoralJubileeItem(card)) jubilee.push(card)
    else archive.push(card)
  })
  return {
    jubilee: sortDisplayCards(jubilee),
    archive: sortDisplayCards(archive)
  }
}

/** Split each record into: image-only clipping card(s) + normal link card(s) + video. */
function toDisplayCards(articles) {
  const cards = []

  articles.forEach((raw) => {
    const article = withClippingDefaults(raw)
    const hasVideo = !!(article.video && String(article.video).trim())
    const hasClippingImage = !!(article.isClipping && article.image)
    const hasLinkContent =
      !!(article.articleUrl && article.articleUrl.trim()) ||
      !!(article.title && article.title.trim() && article.excerpt && article.excerpt.trim())

    if (hasClippingImage) {
      cards.push({
        ...article,
        _cardKey: `${article.id || article._id}-image`,
        _cardType: 'image'
      })
    }

    if (hasVideo) {
      cards.push({
        ...article,
        _cardKey: `${article.id || article._id}-video`,
        _cardType: 'video',
        _isYouTube: isYouTubeVideo(article.video)
      })
    }

    // Normal link / text card — never carry the newspaper scan thumbnail
    // Skip pure video / YouTube entries (video already has its own card).
    const videoIsYouTube = isYouTubeVideo(article.video)
    const linkIsSameYouTube =
      videoIsYouTube &&
      article.articleUrl &&
      (isYouTubeVideo(article.articleUrl) || getYouTubeVideoId(article.articleUrl) === getYouTubeVideoId(article.video))
    if (hasVideo && !hasClippingImage && (!(article.articleUrl && article.articleUrl.trim()) || linkIsSameYouTube)) {
      return
    }

    if (hasLinkContent && (!hasClippingImage || article.articleUrl)) {
      cards.push({
        ...article,
        image: hasClippingImage ? null : article.image,
        video: null,
        isClipping: false,
        _cardKey: `${article.id || article._id}-link`,
        _cardType: 'link'
      })
    } else if (!hasClippingImage && !hasVideo) {
      cards.push({
        ...article,
        _cardKey: `${article.id || article._id}-link`,
        _cardType: 'link'
      })
    }
  })

  return sortDisplayCards(cards)
}

export const MEDIA_ARTICLES = [
  // ── English papers (newest first) ───────────────────────────────────────
  {
    id: 'metro-india-epaper-2026-11-22',
    title: 'Metro India E-Paper: Main Edition Coverage',
    outlet: 'Metro India',
    outletType: 'Print & Newspapers',
    date: '22/11/2026',
    category: 'E-Paper & Print',
    badge: 'METRO INDIA E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'Metro India main edition e-paper coverage of Swayamkrushi and related Hyderabad news.',
    readTime: 'E-Paper Edition',
    tags: ['Metro India', 'E-Paper', 'Hyderabad', 'Swayamkrushi'],
    articleUrl: 'https://share.google/EE5rEX5R5rQBfYrKp',
    featured: true,
    order: -6
  },
  {
    id: 'fpj-mumbai-epaper-2026-11-22',
    title: 'FPJ Mumbai E-Paper: Swayamkrushi Coverage',
    outlet: 'Free Press Journal Mumbai',
    outletType: 'Print & Newspapers',
    date: '22/11/2026',
    category: 'E-Paper & Print',
    badge: 'FPJ MUMBAI E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'Free Press Journal Mumbai e-paper edition featuring Swayamkrushi’s work and celebrations.',
    readTime: 'E-Paper Edition',
    tags: ['FPJ', 'Free Press Journal', 'Mumbai', 'E-Paper'],
    articleUrl: 'https://share.google/qRCg13Pq9tKZtvjBj',
    featured: true,
    order: -5
  },
  {
    id: 'deccan-chronicle-epaper-2026-11-17',
    title: 'Deccan Chronicle E-Paper: Swayamkrushi in Focus',
    outlet: 'Deccan Chronicle',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'E-Paper & Print',
    badge: 'DECCAN CHRONICLE E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'Deccan Chronicle e-paper edition featuring coverage of Swayamkrushi’s work and celebrations.',
    readTime: 'E-Paper Edition',
    tags: ['Deccan Chronicle', 'E-Paper', 'Hyderabad', 'Swayamkrushi'],
    articleUrl: 'https://share.google/6xjNHQ8PHIW1ejbVX',
    featured: true,
    order: -4
  },
  {
    id: 'hindu-former-vp-youth-social-initiatives-2026-11-16',
    title: 'Former VP Urges Youth to Take Part in Meaningful Social Initiatives',
    outlet: 'The Hindu',
    outletType: 'Digital & Magazines',
    date: '16/11/2026',
    category: 'Digital Press',
    badge: 'THE HINDU',
    image: null,
    isClipping: false,
    excerpt: 'Former Vice-President M. Venkaiah Naidu urges youth to join meaningful social initiatives at Swayamkrushi’s Coral Jubilee, as Minister Seethakka visits the campus.',
    readTime: '3 min read',
    tags: ['The Hindu', 'Venkaiah Naidu', 'Seethakka', 'Coral Jubilee'],
    articleUrl: 'https://www.thehindu.com/news/cities/Hyderabad/former-vp-urges-youth-to-take-part-in-meaningful-social-initiatives/article71708164.ece',
    featured: true,
    order: -3
  },
  {
    id: 'telangana-today-epaper-2026-11-17',
    title: 'Telangana Today E-Paper: Hyderabad Edition Coverage',
    outlet: 'Telangana Today',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'E-Paper & Print',
    badge: 'TELANGANA TODAY E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'Telangana Today Hyderabad e-paper edition covering Swayamkrushi and related community initiatives.',
    readTime: 'E-Paper Edition',
    tags: ['Telangana Today', 'E-Paper', 'Hyderabad', 'Swayamkrushi'],
    articleUrl: 'https://epaper.telanganatoday.com/article/Hyderabad?OrgId=1711b08436b1&imageview=1&standalone=1&device=mobile',
    featured: true,
    order: -2
  },
  {
    id: 'fpj-international-epaper-2026-11-17',
    title: 'FPJ International E-Paper: Swayamkrushi Coverage',
    outlet: 'Free Press Journal International',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'E-Paper & Print',
    badge: 'FPJ INTERNATIONAL',
    image: null,
    isClipping: false,
    excerpt: 'Free Press Journal International e-paper edition featuring Swayamkrushi’s work and celebrations.',
    readTime: 'E-Paper PDF',
    tags: ['FPJ', 'Free Press Journal', 'E-Paper', 'International'],
    articleUrl: '/media-buzz/fpj-international-epaper-2026-11-17.pdf',
    featured: true,
    order: -1
  },
  {
    id: 'metro-india-epaper-2026-11-17',
    title: 'Metro India E-Paper: Main Edition Coverage',
    outlet: 'Metro India',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'E-Paper & Print',
    badge: 'METRO INDIA E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'Metro India main edition e-paper coverage of Swayamkrushi and related Hyderabad news.',
    readTime: 'E-Paper Edition',
    tags: ['Metro India', 'E-Paper', 'Hyderabad', 'Swayamkrushi'],
    articleUrl: 'https://epaper.metroindia.net/MainEdition?eid=1&edate=17/11/2026&pgid=9424&device=mobile&view=0&sedId=0&uemail=',
    featured: true,
    order: 0
  },
  {
    id: 'deccan-chronicle-35-years',
    title: 'Swayamkrushi Marks 35 Years Of Empowering Persons With Disabilities',
    outlet: 'Deccan Chronicle',
    outletType: 'Digital & Magazines',
    date: 'August 2026',
    category: 'Digital Press',
    badge: 'DECCAN CHRONICLE',
    image: null,
    isClipping: false,
    excerpt: 'Deccan Chronicle spotlights Swayamkrushi’s milestone 35th anniversary, celebrating more than three decades of pioneering residential care, vocational skill building, and dedicated support for persons with intellectual disabilities.',
    readTime: '3 min read',
    tags: ['Deccan Chronicle', '35 Years', 'Milestone Celebration', 'Special Education'],
    articleUrl: 'https://www.deccanchronicle.com/southern-states/telangana/swayamkrushi-marks-35-years-of-empowering-persons-with-disabilities-1975055',
    featured: true,
    order: 1
  },
  {
    id: 'telangana-today-35-years',
    title: 'Swayamkrushi Marks 35 Years of Empowering Persons with Intellectual Disabilities',
    outlet: 'Telangana Today',
    outletType: 'Digital & Magazines',
    date: 'August 2026',
    category: 'Online Edition',
    badge: 'TELANGANA TODAY',
    image: null,
    isClipping: false,
    excerpt: 'Telangana Today spotlights the 35th-anniversary celebration of Swayamkrushi, highlighting the school, women’s group homes, and university-affiliated collegiate institution empowering persons with intellectual disabilities.',
    readTime: '4 min read',
    tags: ['Telangana Today', '35 Years', 'Hyderabad', 'Special Education'],
    articleUrl: 'https://telanganatoday.com/swayamkrushi-marks-35-years-of-empowering-persons-with-intellectual-disabilities',
    featured: true,
    order: 2
  },
  {
    id: 'newsmeter-classrooms-to-careers',
    title: 'From Classrooms to Careers, Hyderabad’s Swayamkrushi Has Been Empowering Lives for Over 3 Decades',
    outlet: 'NewsMeter',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'In-Depth Feature',
    badge: 'FEATURE STORY',
    image: null,
    isClipping: false,
    excerpt: 'A comprehensive investigation into how Swayamkrushi nurtures children with intellectual challenges into self-reliant adults equipped with job skills, emotional independence, and dignified careers across corporate and creative fields.',
    readTime: '5 min read',
    tags: ['NewsMeter', 'Career Transitions', 'Vocational Training', '3 Decades'],
    articleUrl: 'https://newsmeter.in/hyderabad/from-classrooms-to-careers-hyderabads-swayamkrushi-has-been-empowering-lives-for-over-3-decades-772608',
    featured: true,
    order: 3
  },
  {
    id: 'telangana-today-epaper-35-years',
    title: 'Artist who paints with elbow stumps',
    outlet: 'Telangana Today',
    outletType: 'Print & Newspapers',
    date: 'August 2026',
    category: 'E-Paper & Print',
    badge: 'TELANGANA TODAY E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'Telangana Today print & e-paper edition feature on Swayamkrushi’s 35th milestone, celebrating founder Manjulaa Kalyaan and the journey of special education in Secunderabad.',
    readTime: 'E-Paper Edition',
    tags: ['Telangana Today', 'E-Paper', 'Hyderabad District', 'Special Education'],
    articleUrl: 'https://epaper.telanganatoday.com/article/Hyderabad?OrgId=30830d8e731&imageview=1&standalone=1&device=desktop',
    featured: false,
    order: 4
  },
  {
    id: 'newsmeter-bharati-saini-art',
    title: 'Art Without Limits: Uttarakhand Artist Bharati Saini Turns Elbow Stumps into Tools for Painting',
    outlet: 'NewsMeter',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Fine Arts & Inclusion',
    badge: 'HUMAN IMPACT',
    image: null,
    isClipping: false,
    excerpt: 'An inspiring profile on artist Bharati Saini, who triumphed over adversity to produce breathtaking paintings, highlighting the boundless creative potential fostered within the Swayamkrushi family.',
    readTime: '4 min read',
    tags: ['Fine Arts', 'Inspiring Story', 'NewsMeter', 'Creative Vocational'],
    articleUrl: 'https://newsmeter.in/lifestyle/art-without-limits-uttarakhand-artist-bharati-saini-turns-elbow-stumps-into-tools-for-painting-774531',
    featured: false,
    order: 5
  },
  {
    id: 'hindu-35-years-milestone',
    title: 'NGO Celebrates 35 Years of Serving Persons with Intellectual Disabilities',
    outlet: 'The Hindu',
    outletType: 'Print & Newspapers',
    date: 'August 2026',
    category: 'Newspaper Clipping',
    badge: 'THE HINDU SPOTLIGHT',
    image: hinduClipping,
    isClipping: true,
    excerpt: 'Swayamkrushi, a Hyderabad-based non-profit organisation working for persons with intellectual disabilities, is celebrating 35 years of service with a focus on education, vocational training and independent living. Founder Manjulaa Kalyaan was felicitated by dignitaries.',
    readTime: 'Newspaper Report',
    tags: ['The Hindu', '35th Anniversary', 'Founder Felicitation', 'Special Education'],
    articleUrl: 'https://share.google/YhznuCLOlokk6iVY6',
    featured: true,
    order: 6
  },
  // ── Telugu papers (newest first) ────────────────────────────────────────
  {
    id: 'eenadu-clipping-abhinandaneeyam-2026-11-17',
    title: "'స్వయంకృషి' అభినందనీయం",
    outlet: 'Eenadu',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'Telugu Clipping',
    badge: 'EENADU',
    image: eenaduClipping20261117a,
    isClipping: true,
    excerpt: 'ఈనాడు కథనం: జవహర్‌నగర్‌లో స్వయంకృషి 35వ వార్షికోత్సవం — విద్యార్థుల సాంస్కృతిక ప్రదర్శనలు, ఉపాధ్యాయులకు పురస్కారాలు.',
    readTime: 'Telugu Clipping',
    tags: ['Eenadu', 'Coral Jubilee', 'Telugu Clipping', 'Hyderabad'],
    articleUrl: '',
    featured: true,
    order: -20
  },
  {
    id: 'eenadu-clipping-equal-opportunities-2026-11-17',
    title: 'మానసిక దివ్యాంగులకు సమాన అవకాశాలు కల్పించాలి',
    outlet: 'Eenadu',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'Telugu Clipping',
    badge: 'EENADU',
    image: eenaduClipping20261117b,
    isClipping: true,
    excerpt: 'ఈనాడు కథనం: మాజీ ఉపరాష్ట్రపతి వెంకయ్య నాయుడు వర్చువల్‌గా మాట్లాడుతూ, మంత్రి సీతక్క హాజరై స్వయంకృషి 35వ వార్షికోత్సవాన్ని ఘనంగా నిర్వహించారు.',
    readTime: 'Telugu Clipping',
    tags: ['Eenadu', 'Venkaiah Naidu', 'Seethakka', 'Telugu Clipping'],
    articleUrl: '',
    featured: true,
    order: -19
  },
  {
    id: 'eenadu-clipping-rare-gift-2026-11-17',
    title: 'అనితర సేవకు.. అరుదైన బహుమతి',
    outlet: 'Eenadu',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'Telugu Clipping',
    badge: 'EENADU',
    image: eenaduClipping20261117c,
    isClipping: true,
    excerpt: 'ఈనాడు కథనం: కల్నల్ కుమార్ స్వయంకృషి వ్యవస్థాపకురాలు మంజులా కల్యాణ్‌కు అరుదైన జాతీయ పతాకాన్ని బహుమతిగా అందజేశారు.',
    readTime: 'Telugu Clipping',
    tags: ['Eenadu', 'Manjulaa Kalyaan', 'Telugu Clipping', 'Hyderabad'],
    articleUrl: '',
    featured: true,
    order: -18
  },
  {
    id: 'eenadu-online-equal-opportunities-2026-11-17',
    title: 'మానసిక దివ్యాంగులకు సమాన అవకాశాలు కల్పించాలి',
    outlet: 'Eenadu',
    outletType: 'Digital & Magazines',
    date: '17/11/2026',
    category: 'Regional Press',
    badge: 'EENADU ONLINE',
    image: null,
    isClipping: false,
    excerpt: 'ఈనాడు ఆన్‌లైన్ కథనం: మాజీ ఉపరాష్ట్రపతి వెంకయ్య నాయుడు స్వయంకృషి 35వ వార్షికోత్సవంలో మానసిక దివ్యాంగులకు సమాన అవకాశాలు కల్పించాలని పిలుపునిచ్చారు.',
    readTime: 'Telugu Online',
    tags: ['Eenadu', 'Online', 'Venkaiah Naidu', 'Hyderabad'],
    articleUrl: 'https://www.eenadu.net/telugu-news/districts/hyderabad-news/529/126208783',
    featured: true,
    order: -17
  },
  {
    id: 'sakshi-clipping-seethakka-2026-11-17',
    title: "'స్వయం కృషి' సేవలు ఆదర్శనీయం : మంత్రి సీతక్క",
    outlet: 'Sakshi',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'Telugu Clipping',
    badge: 'SAKSHI',
    image: sakshiClipping20261117,
    isClipping: true,
    excerpt: 'సాక్షి కథనం: మంత్రి సీతక్క స్వయంకృషి సేవలను ఆదర్శనీయమని అభినందించారు — 35వ కోరల్ జూబ్లీ వేడుకలు.',
    readTime: 'Telugu Clipping',
    tags: ['Sakshi', 'Seethakka', 'Telugu Clipping', 'Coral Jubilee'],
    articleUrl: '',
    featured: true,
    order: -16
  },
  {
    id: 'mana-telangana-epaper-2026-11-17',
    title: 'Mana Telangana E-Paper: Hyderabad Edition',
    outlet: 'Mana Telangana',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'Regional Press',
    badge: 'MANA TELANGANA E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'మన తెలంగాణ హైదరాబాద్ ఎడిషన్ ఈ-పేపర్ కథనం: స్వయంకృషి 35వ వార్షికోత్సవం సంబంధిత కవరేజ్.',
    readTime: 'Telugu E-Paper',
    tags: ['Mana Telangana', 'E-Paper', 'Hyderabad', 'Telugu'],
    articleUrl: 'https://epaper.manatelangana.news/reader/4221753/HYDERABAD/17-11-2026/page/3/2/rw',
    featured: true,
    order: -15
  },
  {
    id: 'netram-clipping-venkaiah-2026-11-17',
    title: 'యువత సామాజిక సేవా కార్యక్రమాల్లో పాల్గొనాలి — వెంకయ్య నాయుడు పిలుపు',
    outlet: 'Netram',
    outletType: 'Print & Newspapers',
    date: '17/11/2026',
    category: 'Telugu Clipping',
    badge: 'NETRAM',
    image: netramClipping20261117,
    isClipping: true,
    excerpt: 'నేత్రం కథనం: మాజీ ఉపరాష్ట్రపతి వెంకయ్య నాయుడు యువతను సామాజిక సేవలో పాల్గొనాలని పిలుపునిచ్చారు — స్వయంకృషి 35 ఏళ్ల వేడుకలు.',
    readTime: 'Telugu Clipping',
    tags: ['Netram', 'Venkaiah Naidu', 'Telugu Clipping', 'Coral Jubilee'],
    articleUrl: '',
    featured: true,
    order: -14
  },
  {
    id: 'mana-telangana-35-years',
    title: 'Mana Telangana: 35 ఏళ్ల స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Mana Telangana',
    outletType: 'Print & Newspapers',
    date: '04/08/2026',
    category: 'Regional Press',
    badge: 'MANA TELANGANA E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'మన తెలంగాణ దినపత్రిక కథనం: మూడున్నర దశాబ్దాల పాటు మేధో వైకల్యం కలిగిన వ్యక్తుల విద్య, జీవనోపాధి, సాధికారతకు విశేష కృషి చేస్తున్న స్వయంకృషి సంస్థ ప్రస్థానం.',
    readTime: 'Telugu E-Paper',
    tags: ['Mana Telangana', '35 Years', 'Telugu E-Paper', 'Hyderabad'],
    articleUrl: 'https://epaper.manatelangana.news/4183407/HYDERABAD/04-08-2026#issue/4/2',
    featured: false,
    order: 10
  },
  {
    id: 'sakshi-hyderabad-district',
    title: 'Sakshi Hyderabad District Edition: 35 ఏళ్ల స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Sakshi Telugu Daily',
    outletType: 'Print & Newspapers',
    date: '09/08/2026',
    category: 'Regional Press',
    badge: 'SAKSHI E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'సాక్షి హైదరాబాద్ ఎడిషన్ కథనం: మూడున్నర దశాబ్దాలుగా మానసిక వికలాంగుల వికాసం, విద్యాబోధన, జీవనోపాధి కల్పిస్తున్న స్వయంకృషి సంస్థ సేవలు ఆదర్శనీయం.',
    readTime: 'Telugu E-Paper',
    tags: ['Sakshi Daily', 'Telugu E-Paper', 'District Edition', 'Residential Care'],
    articleUrl: 'https://epaper.sakshi.com/login/loginpage?ReturnUrl=%2fHyderabad_Main%3feid%3d123%26edate%3d09%2f08%2f2026%26pgid%3d916473%26device%3dmobile%26view%3d0%26sedId%3d0%26uemail%3d&eid=123&edate=09/08/2026&pgid=916473&device=mobile&view=0&sedId=0&uemail=',
    featured: false,
    order: 11
  },
  {
    id: 'eenadu-epaper-2026-10-10',
    title: 'Eenadu E-Paper: 35 ఏళ్ల స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Eenadu Telugu Daily',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Telugu Clipping',
    badge: 'EENADU TELUGU DAILY',
    image: eenaduClipping,
    isClipping: true,
    excerpt: 'ఈనాడు దినపత్రిక కథనం: మేధో వైకల్యం కలిగిన వ్యక్తుల సాధికారత, విద్యాబోధన, జీవనోపాధి మరియు సంరక్షణకు విశేష కృషి చేస్తున్న స్వయంకృషి సంస్థ ప్రస్థానం.',
    readTime: 'Telugu Clipping',
    tags: ['Eenadu', 'Telugu E-Paper', 'Regional Press', 'Special Education'],
    articleUrl: 'https://epaper.eenadu.net/Home/Index?date=10/10/2026&eid=239&pid=3613532',
    featured: false,
    order: 12
  },
  {
    id: 'ninadam-telangana-2026-10-10',
    title: 'Ninadam Telangana: స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Ninadam News',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Regional Press',
    badge: 'NINADAM E-PAPER',
    image: null,
    isClipping: false,
    excerpt: 'నినాదం తెలంగాణ దినపత్రిక కథనం: ప్రత్యేక అవసరాలు గల వ్యక్తుల అభ్యున్నతి, సంరక్షణ మరియు జీవనోపాధి కల్పిస్తున్న స్వయంకృషి సంస్థ విశేష సేవా కథనం.',
    readTime: 'Telugu E-Paper',
    tags: ['Ninadam News', 'Telugu E-Paper', 'Telangana', 'Community Care'],
    articleUrl: 'https://epaper.ninadamnews.com/paper.php?date=2026-10-10&edition=80',
    featured: false,
    order: 13
  },
  {
    id: 'andhra-prabha-rangareddy-2026-10-10',
    title: 'Andhra Prabha Rangareddy Edition: స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Andhra Prabha',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Telugu Clipping',
    badge: 'ANDHRA PRABHA',
    image: andhraPrabhaClipping,
    isClipping: true,
    excerpt: 'ఆంధ్రప్రభ రంగారెడ్డి జిల్లా ఎడిషన్ కథనం: మేధోపరమైన సవాళ్లు ఉన్న వ్యక్తులకు విద్యాబోధన, వృత్తి శిక్షణ మరియు పునరావాస సేవలందిస్తున్న స్వయంకృషి సంస్థ ప్రస్థానం.',
    readTime: 'Telugu Clipping',
    tags: ['Andhra Prabha', 'Rangareddy District', 'Telugu E-Paper', 'Vocational Training'],
    articleUrl: 'https://epaper.prabhanews.com/viewer/?date=2026-10-10&section=Telangana+Districts&edition=Rangareddy&page=2',
    featured: false,
    order: 14
  },
  {
    id: 'andhra-jyothy-uppal-malkajgiri-2026-10-10',
    title: 'Andhra Jyothy Uppal-Malkajgiri Edition: స్వయంకృషి సేవా ప్రస్థానం',
    outlet: 'Andhra Jyothy',
    outletType: 'Print & Newspapers',
    date: '10/10/2026',
    category: 'Telugu Clipping',
    badge: 'ANDHRA JYOTHY',
    image: andhraJyothyClipping,
    isClipping: true,
    excerpt: 'ఆంధ్రజ్యోతి ఉప్పల్-మల్కాజ్‌గిరి ఎడిషన్ కథనం: మూడున్నర దశాబ్దాలుగా మానసిక వికలాంగుల వికాసం, విద్యాబోధన, సంరక్షణ మరియు జీవనోపాధి కల్పిస్తున్న స్వయంకృషి సంస్థ.',
    readTime: 'Telugu Clipping',
    tags: ['Andhra Jyothy', 'Uppal Malkajgiri', 'Telugu E-Paper', 'Special Education'],
    articleUrl: 'https://epaper.andhrajyothy.com/Hyd_Uppal_Malkajgiri?eid=122&edate=10/10/2026&pgid=1524855&device=desktop&view=3',
    featured: false,
    order: 15
  },
  {
    id: 'aadab-hyderabad-purple-day-2026-03-27',
    title: 'ఎపిలెప్సీ(మూర్ఛ)పై అపోహలను తొలగించాలి',
    outlet: 'Aadab Hyderabad',
    outletType: 'Print & Newspapers',
    date: '27/03/2026',
    category: 'Telugu Clipping',
    badge: 'AADAB HYDERABAD',
    image: aadabPurpleDayClipping,
    isClipping: true,
    excerpt: 'ఆదాబ్ హైదరాబాద్ కథనం: పర్పుల్ డే సందర్భంగా స్వయంకృషి వ్యవస్థాపకురాలు డా. మంజులా కళ్యాణ్ ఎపిలెప్సీపై అపోహలు తొలగించాలని పిలుపునిచ్చారు.',
    readTime: 'Telugu Clipping',
    tags: ['Aadab Hyderabad', 'Purple Day', 'Epilepsy Awareness', 'Telugu E-Paper'],
    articleUrl: 'https://epaper.aadabhyderabad.in/',
    featured: false,
    order: 20
  },
  {
    id: 'nijam-cheputham-purple-day-2026-03-27',
    title: 'ఎపిలెప్సీ(మూర్ఛ)పై అపోహలను తొలగించాలి',
    outlet: 'Nijam Cheputham',
    outletType: 'Print & Newspapers',
    date: '27/03/2026',
    category: 'Telugu Clipping',
    badge: 'NIJAM CHEPUTHAM',
    image: nijamPurpleDayClipping,
    isClipping: true,
    excerpt: 'నిజం చెబుతాం కథనం: సోమాజిగూడ ప్రెస్ క్లబ్‌లో పర్పుల్ డే అవగాహన కార్యక్రమం — స్వయంకృషి ద్వారా ఎపిలెప్సీ బాధితులకు సమగ్ర సహకారం.',
    readTime: 'Telugu Clipping',
    tags: ['Nijam Cheputham', 'Purple Day', 'Epilepsy Awareness', 'Telugu E-Paper'],
    articleUrl: 'https://epaper.nijamnews.in/clip/154307',
    featured: false,
    order: 21
  },
  {
    id: 'iview-news-purple-day-2026-03-27',
    title: 'ఎపిలెప్సీ (మూర్ఛ)పై అపోహలను తొలగించాలి',
    outlet: 'iView News',
    outletType: 'Print & Newspapers',
    date: '27/03/2026',
    category: 'Telugu Clipping',
    badge: 'IVIEW NEWS',
    image: iviewPurpleDayClipping,
    isClipping: true,
    excerpt: 'iవ్యూ న్యూస్ కథనం: పర్పుల్ డే సందర్భంగా స్వయంకృషి నిర్వహించిన ఎపిలెప్సీ అవగాహన కార్యక్రమం మరియు PurpleDay.org.in వెబ్‌సైట్ ప్రారంభం.',
    readTime: 'Telugu Clipping',
    tags: ['iView News', 'Purple Day', 'Epilepsy Awareness', 'Telugu E-Paper'],
    articleUrl: 'https://epaper.iviewnews.in',
    featured: false,
    order: 22
  },
  {
    id: 'andhra-prabha-purple-day-2026-03-27',
    title: 'మూర్ఛ వ్యాధిపై అపోహలు తొలగించాలి',
    outlet: 'Andhra Prabha',
    outletType: 'Print & Newspapers',
    date: '27/03/2026',
    category: 'Telugu Clipping',
    badge: 'ANDHRA PRABHA',
    image: andhraPrabhaPurpleDayClipping,
    isClipping: true,
    excerpt: 'ఆంధ్రప్రభ కథనం: ఖైరతాబాద్ — డా. మంజులా కళ్యాణ్ పర్పుల్ డే సందర్భంగా ఎపిలెప్సీపై అపోహలు తొలగించాలని పిలుపునిచ్చారు.',
    readTime: 'Telugu Clipping',
    tags: ['Andhra Prabha', 'Purple Day', 'Epilepsy Awareness', 'Telugu E-Paper'],
    articleUrl: 'https://epaper.prabhanews.com',
    featured: false,
    order: 23
  },
  {
    id: 'purple-day-epilepsy-awareness-video',
    title: 'Purple Day Epilepsy Awareness — Swayamkrushi',
    outlet: 'Swayamkrushi Media',
    outletType: 'Digital & Magazines',
    date: 'March 2026',
    category: 'Video Coverage',
    badge: 'VIDEO',
    image: null,
    video: '/media-buzz/purple-day-epilepsy-awareness-2026.mp4',
    isClipping: false,
    excerpt: 'Video coverage from Swayamkrushi’s Purple Day epilepsy awareness programme.',
    readTime: 'Video',
    tags: ['Purple Day', 'Epilepsy Awareness', 'Video', 'Swayamkrushi'],
    articleUrl: '',
    featured: false,
    order: 99
  },
  {
    id: 'tv9-coral-jubilee-celebrations',
    title: 'Swayamkrushi - Coral Jubilee Celebrations',
    outlet: 'TV9',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Video Coverage',
    badge: 'VIDEO',
    image: null,
    video: '/media-buzz/tv9-coral-jubilee-celebrations.mp4',
    isClipping: false,
    excerpt: 'TV9 coverage of Swayamkrushi Coral Jubilee celebrations.',
    readTime: 'Video',
    tags: ['TV9', 'Coral Jubilee', 'Video', 'Swayamkrushi'],
    articleUrl: '',
    featured: true,
    order: 100
  },
  {
    id: 'youtube-abn-seethakka',
    title: 'Minister Seethakka Visited Swayamkrushi Organization in Jawaharnagar | Hyderabad',
    outlet: 'ABN Telugu',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Video Coverage',
    badge: 'YOUTUBE',
    image: null,
    video: 'https://www.youtube.com/watch?v=PWe1PCnOCdM',
    isClipping: false,
    excerpt: 'ABN Telugu reports on Minister Seethakka’s visit to the Swayamkrushi organisation in Jawaharnagar, Hyderabad.',
    readTime: 'YouTube',
    tags: ['YouTube', 'ABN Telugu', 'Seethakka', 'Hyderabad'],
    articleUrl: 'https://youtu.be/PWe1PCnOCdM',
    featured: true,
    order: 101
  },
  {
    id: 'youtube-etv-seethakka',
    title: 'స్వయంకృషి సంస్థను సందర్శించిన మంత్రి సీతక్క',
    outlet: 'ETV Telangana',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Video Coverage',
    badge: 'YOUTUBE',
    image: null,
    video: 'https://www.youtube.com/watch?v=fqH8vlNlX9c',
    isClipping: false,
    excerpt: 'ETV Telangana coverage of Minister Seethakka’s visit to Swayamkrushi and her interaction with the organisation.',
    readTime: 'YouTube',
    tags: ['YouTube', 'ETV Telangana', 'Seethakka', 'Telugu'],
    articleUrl: 'https://youtu.be/fqH8vlNlX9c',
    featured: true,
    order: 102
  },
  {
    id: 'youtube-swatantra-tv-seethakka',
    title: 'Seethakka Appreciates Swayamkrushi Organization | Special Visit to Disabled Students',
    outlet: 'Swatantra TV',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Video Coverage',
    badge: 'YOUTUBE',
    image: null,
    video: 'https://www.youtube.com/watch?v=q7eGQKm59jc',
    isClipping: false,
    excerpt: 'Swatantra TV covers Minister Seethakka’s special visit to Swayamkrushi and her appreciation of the organisation’s work with students with disabilities.',
    readTime: 'YouTube',
    tags: ['YouTube', 'Swatantra TV', 'Seethakka', 'Swayamkrushi'],
    articleUrl: 'https://youtu.be/q7eGQKm59jc',
    featured: true,
    order: 103
  },
  {
    id: 'youtube-100-tv-seethakka',
    title: "జవహర్‌నగర్ 'స్వయంకృషి' సేవా సంస్థను సందర్శించిన మంత్రి సీతక్క",
    outlet: '100 TV News',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Video Coverage',
    badge: 'YOUTUBE',
    image: null,
    video: 'https://www.youtube.com/watch?v=0C-wA51-WJI',
    isClipping: false,
    excerpt: '100 TV News coverage of Minister Seethakka’s visit to Swayamkrushi in Jawaharnagar and her focus on the welfare of persons with disabilities.',
    readTime: 'YouTube',
    tags: ['YouTube', '100 TV', 'Seethakka', 'Telugu'],
    articleUrl: 'https://youtu.be/0C-wA51-WJI',
    featured: true,
    order: 104
  },
  {
    id: 'youtube-dd-news-seethakka',
    title: 'Minister Seethakka Attends 35th Anniversary Celebrations of Swayamkrushi in Jawaharnagar',
    outlet: 'DD NEWS Telangana',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Video Coverage',
    badge: 'YOUTUBE',
    image: null,
    video: 'https://www.youtube.com/watch?v=T0vwBO5iPBc',
    isClipping: false,
    excerpt: 'DD NEWS Telangana coverage of Minister Seethakka attending Swayamkrushi’s 35th anniversary celebrations in Jawaharnagar.',
    readTime: 'YouTube',
    tags: ['YouTube', 'DD NEWS Telangana', 'Seethakka', 'Coral Jubilee'],
    articleUrl: 'https://youtu.be/T0vwBO5iPBc',
    featured: true,
    order: 99
  },
  {
    id: 'brk-news-reporter-ramu',
    title: 'BRK News: Swayamkrushi Coverage — Reporter Ramu',
    outlet: 'BRK NEWS Reporter Ramu',
    outletType: 'Digital & Magazines',
    date: '2026',
    category: 'Video Coverage',
    badge: 'VIDEO',
    image: null,
    video: '/media-buzz/brk-news-reporter-ramu.mp4',
    isClipping: false,
    excerpt: 'BRK News coverage of Swayamkrushi, reported by Ramu.',
    readTime: 'Video',
    tags: ['BRK News', 'Reporter Ramu', 'Video', 'Swayamkrushi'],
    articleUrl: '',
    featured: true,
    order: 105
  }
]

export default function MediaBuzzPage() {
  const [jubileeCards, setJubileeCards] = useState([])
  const [archiveCards, setArchiveCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadBuzz() {
      const applyCards = (articles) => {
        const { jubilee, archive } = splitJubileeAndArchive(toDisplayCards(articles))
        setJubileeCards(jubilee)
        setArchiveCards(archive)
      }

      try {
        const data = await fetchMediaBuzz()
        if (Array.isArray(data) && data.length > 0) {
          const validData = data.filter((a) => a.title && a.title.trim() && !isIdDeleted('media_buzz', a.id) && !isIdDeleted('media_buzz', a._id))
          const existingIds = new Set(validData.map((a) => a.id))
          const missingDefaults = MEDIA_ARTICLES.filter((a) => !existingIds.has(a.id) && !isIdDeleted('media_buzz', a.id))
          const titleFixes = {
            'telangana-today-epaper-35-years': 'Artist who paints with elbow stumps'
          }
          const orderFixes = {
            'metro-india-epaper-2026-11-22': -6,
            'fpj-mumbai-epaper-2026-11-22': -5,
            'deccan-chronicle-epaper-2026-11-17': -4,
            'hindu-former-vp-youth-social-initiatives-2026-11-16': -3,
            'telangana-today-epaper-2026-11-17': -2,
            'fpj-international-epaper-2026-11-17': -1,
            'metro-india-epaper-2026-11-17': 0,
            'eenadu-clipping-abhinandaneeyam-2026-11-17': -20,
            'eenadu-clipping-equal-opportunities-2026-11-17': -19,
            'eenadu-clipping-rare-gift-2026-11-17': -18,
            'eenadu-online-equal-opportunities-2026-11-17': -17,
            'sakshi-clipping-seethakka-2026-11-17': -16,
            'mana-telangana-epaper-2026-11-17': -15,
            'netram-clipping-venkaiah-2026-11-17': -14,
            'youtube-dd-news-seethakka': 99,
            'tv9-coral-jubilee-celebrations': 100,
            'youtube-abn-seethakka': 101,
            'youtube-etv-seethakka': 102,
            'youtube-swatantra-tv-seethakka': 103,
            'youtube-100-tv-seethakka': 104,
            'brk-news-reporter-ramu': 105
          }
          const combined = [...validData, ...missingDefaults]
            .map((item) => {
              let next = item
              if (titleFixes[item.id]) next = { ...next, title: titleFixes[item.id] }
              if (orderFixes[item.id] != null) next = { ...next, order: orderFixes[item.id] }
              return next
            })
            .map(withClippingDefaults)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
          applyCards(combined)
        } else {
          applyCards(MEDIA_ARTICLES.filter((a) => !isIdDeleted('media_buzz', a.id)))
        }
      } catch (err) {
        console.warn('Error loading media buzz:', err)
        applyCards(MEDIA_ARTICLES.filter((a) => !isIdDeleted('media_buzz', a.id)))
      } finally {
        setLoading(false)
      }
    }
    loadBuzz()
  }, [])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxImage) return
      if (e.key === 'Escape') {
        setLightboxImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxImage])

  const renderCard = (article) => {
    if (article._cardType === 'image') {
      return (
        <article
          key={article._cardKey}
          className="buzz-article-card image-only-card"
          onClick={() =>
            setLightboxImage({
              src: article.image,
              title: article.title || article.outlet,
              outlet: article.outlet
            })
          }
        >
          <div className="buzz-card-media is-clipping-card full-card-image">
            <img
              src={article.image}
              alt={article.title || article.outlet}
              className="buzz-card-img"
              onError={(e) => {
                const fb = CLIPPING_IMAGE_BY_ID[article.id]
                if (fb && e.currentTarget.src !== fb) {
                  e.currentTarget.src = fb
                }
              }}
            />
            <span className="buzz-outlet-badge">{article.outlet}</span>
            <span className="clipping-zoom-hint">🔍 Zoom</span>
          </div>
        </article>
      )
    }

    if (article._cardType === 'video') {
      const youtubeId = getYouTubeVideoId(article.video)
      const youtubeWatchUrl = youtubeId
        ? (article.articleUrl || getYouTubeWatchUrl(article.video))
        : null
      const youtubeEmbed = youtubeId && !isYouTubeEmbedBlocked(article.video)
        ? getYouTubeEmbedUrl(article.video)
        : null
      const youtubeThumb = youtubeId ? getYouTubeThumbnailUrl(article.video) : null
      const isYouTubeCard = Boolean(youtubeId)
      const isCompactVideo = isTopVideoCard(article) || isCoralJubileeItem(article)

      return (
        <article
          key={article._cardKey}
          className={`buzz-article-card buzz-video-card ${isCompactVideo ? 'buzz-youtube-card' : 'buzz-video-wide'}`}
        >
          <div className={`buzz-card-media buzz-video-media ${isCompactVideo ? 'is-youtube' : ''}`}>
            {youtubeEmbed ? (
              <iframe
                className="buzz-card-video buzz-youtube-embed"
                src={youtubeEmbed}
                title={article.title || 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              />
            ) : youtubeThumb ? (
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="buzz-youtube-thumb-link"
                aria-label={`Watch on YouTube: ${article.title || article.outlet}`}
              >
                <img
                  src={youtubeThumb}
                  alt={article.title || article.outlet}
                  className="buzz-youtube-thumb"
                />
                <span className="buzz-youtube-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </span>
              </a>
            ) : (
              <video
                className={`buzz-card-video ${isCompactVideo ? 'buzz-local-compact-video' : ''}`}
                src={article.video}
                controls
                playsInline
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
            <span className="buzz-outlet-badge">{article.outlet}</span>
          </div>
          <div className="buzz-card-body">
            {!isCompactVideo && (
              <div className="buzz-card-meta">
                <span className="buzz-card-date">{article.date} · {article.readTime}</span>
              </div>
            )}
            <h3 className="buzz-card-title">{article.title}</h3>
            {!isCompactVideo && article.excerpt && (
              <p className="buzz-card-excerpt">{article.excerpt}</p>
            )}
            {isYouTubeCard && (
              <div className="buzz-card-footer">
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buzz-card-link-btn"
                >
                  Watch on YouTube &rarr;
                </a>
              </div>
            )}
          </div>
        </article>
      )
    }

    return (
      <article key={article._cardKey} className={`buzz-article-card ${!article.image ? 'no-image-card' : ''}`}>
        {article.image && (
          <div className="buzz-card-media">
            <img src={article.image} alt={article.title} className="buzz-card-img" />
            <span className="buzz-outlet-badge">{article.outlet}</span>
          </div>
        )}
        <div className="buzz-card-body">
          {!article.image && (
            <div className="card-top-outlet-bar">
              <span className="buzz-outlet-badge inline">{article.outlet}</span>
            </div>
          )}
          <div className="buzz-card-meta">
            <span className="buzz-card-date">{article.date} · {article.readTime}</span>
          </div>
          <h3 className="buzz-card-title">{article.title}</h3>
          <p className="buzz-card-excerpt">{article.excerpt}</p>
          {article.articleUrl && (
            <div className="buzz-card-footer">
              <a
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="buzz-card-link-btn"
              >
                Read Full Story &rarr;
              </a>
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <>
      <SEO
        title="Media Buzz & Press Coverage | Swayamkrushi"
        description="Explore press clippings, news features, e-paper editions, and media coverage celebrating 35+ years of Swayamkrushi NGO."
      />

      <div className="media-buzz-wrap">
        <header className="media-buzz-header">
          <h1 className="buzz-headline">Media Buzz</h1>
        </header>

        {loading ? (
          <div className="buzz-articles-grid" style={{ minHeight: '60vh' }}>
            <div style={{ gridColumn: '1 / -1', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f6a6c' }}>
              <p style={{ fontStyle: 'italic', fontSize: '15px' }}>Loading media coverage...</p>
            </div>
          </div>
        ) : (
          <>
            {jubileeCards.length > 0 && (
              <section className="buzz-jubilee-section" aria-labelledby="buzz-jubilee-heading">
                <h2 id="buzz-jubilee-heading" className="buzz-section-title">
                  Celebrating 35 years of glory!
                </h2>
                <div className="buzz-articles-grid">
                  {jubileeCards.map(renderCard)}
                </div>
              </section>
            )}

            {jubileeCards.length > 0 && archiveCards.length > 0 && (
              <div className="buzz-section-divider" role="separator" aria-hidden="true" />
            )}

            {archiveCards.length > 0 && (
              <section className="buzz-archive-section" aria-label="Earlier media coverage">
                <div className="buzz-articles-grid">
                  {archiveCards.map(renderCard)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal for Full-Size Newspaper Clipping */}
      {lightboxImage && (
        <div
          className="buzz-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="buzz-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="buzz-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close Lightbox"
            >
              &times;
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="buzz-lightbox-image"
            />
            <div className="buzz-lightbox-caption">
              <h3>{lightboxImage.title}</h3>
              <p>{lightboxImage.outlet || 'Press Clipping'} · Newspaper Scan</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
