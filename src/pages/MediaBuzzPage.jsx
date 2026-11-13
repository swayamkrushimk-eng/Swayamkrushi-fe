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
import './MediaBuzzPage.css'

const CLIPPING_IMAGE_BY_ID = {
  'hindu-35-years-milestone': hinduClipping,
  'eenadu-epaper-2026-10-10': eenaduClipping,
  'andhra-prabha-rangareddy-2026-10-10': andhraPrabhaClipping,
  'andhra-jyothy-uppal-malkajgiri-2026-10-10': andhraJyothyClipping,
  'aadab-hyderabad-purple-day-2026-03-27': aadabPurpleDayClipping,
  'nijam-cheputham-purple-day-2026-03-27': nijamPurpleDayClipping,
  'iview-news-purple-day-2026-03-27': iviewPurpleDayClipping,
  'andhra-prabha-purple-day-2026-03-27': andhraPrabhaPurpleDayClipping
}

const VIDEO_BY_ID = {
  'purple-day-epilepsy-awareness-video': '/media-buzz/purple-day-epilepsy-awareness-2026.mp4'
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
  'iview'
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
 * Display order:
 * 1) English paper/link cards
 * 2) English newspaper clipping images (e.g. The Hindu)
 * 3) Telugu paper/link cards
 * 4) Other newspaper clipping images
 * 5) Video last
 */
function sortDisplayCards(cards) {
  const rank = (card) => {
    if (card._cardType === 'video') return 4
    if (card._cardType === 'image') {
      return isTeluguArticle(card) ? 3 : 1
    }
    if (isTeluguArticle(card)) return 2
    return 0
  }

  return [...cards].sort((a, b) => {
    const byGroup = rank(a) - rank(b)
    if (byGroup !== 0) return byGroup
    return (a.order || 0) - (b.order || 0)
  })
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
        _cardType: 'video'
      })
    }

    // Normal link / text card — never carry the newspaper scan thumbnail
    // Skip pure video entries (video already has its own card).
    if (hasVideo && !hasClippingImage && !(article.articleUrl && article.articleUrl.trim())) {
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
  // ── English papers ──────────────────────────────────────────────────────
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
  // ── Telugu papers ───────────────────────────────────────────────────────
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
  }
]

export default function MediaBuzzPage() {
  const [articlesList, setArticlesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadBuzz() {
      try {
        const data = await fetchMediaBuzz()
        if (Array.isArray(data) && data.length > 0) {
          const validData = data.filter((a) => a.title && a.title.trim() && !isIdDeleted('media_buzz', a.id) && !isIdDeleted('media_buzz', a._id))
          const existingIds = new Set(validData.map((a) => a.id))
          const missingDefaults = MEDIA_ARTICLES.filter((a) => !existingIds.has(a.id) && !isIdDeleted('media_buzz', a.id))
          const titleFixes = {
            'telangana-today-epaper-35-years': 'Artist who paints with elbow stumps'
          }
          const combined = [...validData, ...missingDefaults]
            .map((item) => (titleFixes[item.id] ? { ...item, title: titleFixes[item.id] } : item))
            .map(withClippingDefaults)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
          setArticlesList(toDisplayCards(combined))
        } else {
          // Fallback to local only if server returns nothing
          setArticlesList(
            toDisplayCards(MEDIA_ARTICLES.filter((a) => !isIdDeleted('media_buzz', a.id)))
          )
        }
      } catch (err) {
        console.warn('Error loading media buzz:', err)
        // Fallback to local on error
        setArticlesList(
          toDisplayCards(MEDIA_ARTICLES.filter((a) => !isIdDeleted('media_buzz', a.id)))
        )
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

  return (
    <>
      <SEO
        title="Media Buzz & Press Coverage | Swayamkrushi"
        description="Explore press clippings, news features, e-paper editions, and media coverage celebrating 35+ years of Swayamkrushi NGO."
      />

      <div className="media-buzz-wrap">
        {/* Masthead Header */}
        <header className="media-buzz-header">
          <h1 className="buzz-headline">Media Buzz</h1>
        </header>

        {/* Media Coverage Grid */}
        <div className="buzz-articles-grid" style={loading ? { minHeight: '60vh' } : undefined}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f6a6c' }}>
              <p style={{ fontStyle: 'italic', fontSize: '15px' }}>Loading media coverage...</p>
            </div>
          ) : articlesList.map((article) => {
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
              return (
                <article key={article._cardKey} className="buzz-article-card buzz-video-card">
                  <div className="buzz-card-media buzz-video-media">
                    <video
                      className="buzz-card-video"
                      src={article.video}
                      controls
                      playsInline
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <span className="buzz-outlet-badge">{article.outlet}</span>
                  </div>
                  <div className="buzz-card-body">
                    <div className="buzz-card-meta">
                      <span className="buzz-card-date">{article.date} · {article.readTime}</span>
                    </div>
                    <h3 className="buzz-card-title">{article.title}</h3>
                    {article.excerpt && <p className="buzz-card-excerpt">{article.excerpt}</p>}
                  </div>
                </article>
              )
            }

            // Normal link / press card — no newspaper scan thumbnail mixed in
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
          })}
        </div>
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
