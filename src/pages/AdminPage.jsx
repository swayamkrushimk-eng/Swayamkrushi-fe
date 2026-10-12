import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  adminLogin,
  fetchAdminStats,
  fetchSettings,
  updateSettings,
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchAccolades,
  createAccolade,
  updateAccolade,
  deleteAccolade,
  fetchCertificates,
  createCertificate,
  deleteCertificate,
  fetchFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  fetchInquiries,
  updateInquiryStatus,
  deleteInquiry,
  uploadImage,
  deleteMediaFromCloudinary,
  fetchCommitteeMembers,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  fetchMediaBuzz,
  createMediaBuzz,
  updateMediaBuzz,
  deleteMediaBuzz,
  fetchEventImages,
  createEventImage,
  deleteEventImage,
  isIdDeleted
} from '../services/api'
import { COMMITTEE_MEMBERS as DEFAULT_COMMITTEE_MEMBERS } from './CommitteePage'
import { MEDIA_ARTICLES as DEFAULT_MEDIA_ARTICLES } from './MediaBuzzPage'
import { isSameImage } from '../utils/mediaUtils'
import './AdminPage.css'

const DEFAULT_ARTICLE_CAPTIONS = {
  'home-of-care': 'FUN AND FROLIC : A video collage of activities In Swayamkrushi',
  'group-homes': 'Residents outside their home — the group homes have run since 1991.',
  'bed-hotspot': 'Staff, students and residents together at a National Trust event.',
  'building-blocks': 'CLASS IN PROGRESS : Chavan, spl educator, explains different concepts to his students',
  'story-sowing-seeds': 'Y Lalitha Kumari guiding special students at the sewing machines',
  'story-tailoring': 'Y Lalitha Kumari guiding special students at the sewing machines',
  'story-luck-hardwork': "GAME ON: When The going gets tough, the tough get going ,that's Srilatha for you",
  'story-15-years': '15 Years for One Word, and Then the Exhilaration!',
  'story-fifteen-years': '15 Years for One Word, and Then the Exhilaration!',
  'story-art-equaliser': 'Art — The Great Equaliser',
  'story-champions': 'Champions All the Way — Special Olympics',
  'story-dairy': 'Dairy for a Purpose!',
  'story-kadiam': 'Destination Kadiam, for Plants',
  'story-encounter': 'Chance Encounter That Changed My Life',
  'story-group-homes-initiative': 'Direct Reflections: Pioneering Group Homes',
  'story-womens-empowerment': "Women's Empowerment — A Swayamkrushi Byproduct",
  'story-direct-speak': 'Direct Speak: Reflections on Thirty-Five Years of Service',
  'story-exercise': 'Exercise of a Different Kind',
  'story-therapy-body-soul-mind': 'Therapy for body, soul and mind',
  'story-hard-work': 'Hard Work Never Goes Unrewarded!',
  'story-kitchen': 'Kitchen — Beehive of Activity',
  'story-sai-baba': "The Mysterious 'Appearance' of Shirdi Sai Baba",
  'story-nios': 'NIOS — Boon for Persons with Intellectual Disabilities',
  'story-paper-bag': "Paper Bag Making — It's a 'Mild' Job",
  'story-recipe-success': 'Recipe for Success!',
  'story-covid': 'The Covid Years — Opportunities to Serve',
  'story-thinking': 'Thinking Out of the Box!',
  'story-visa': 'Visa to Go Abroad',
  'dare-to-dream': 'Dare to Dream — Swayamkrushi Founding Journey'
}

const DEFAULT_ARTICLE_IMAGES = {
  'home-of-care': [
    {
      url: 'https://res.cloudinary.com/ll9equhn/image/upload/v1791531289/swayamkrushi/xg9qemgyszqdhbsjymy8.jpg',
      caption: 'The heart and soul of Swayamkrushi: Manjulaa Kalyaan, Founder-Director',
      alt: 'The heart and soul of Swayamkrushi: Manjulaa Kalyaan, Founder-Director'
    }
  ],
  'story-sowing-seeds': [
    {
      url: 'https://res.cloudinary.com/ll9equhn/image/upload/v1791530115/swayamkrushi/pnui7ub8rucjkivunlmr.jpg',
      caption: 'Y Lalitha Kumari guiding special students at the sewing machines',
      alt: 'Y Lalitha Kumari guiding special students at the sewing machines in Swayamkrushi'
    },
    {
      url: 'https://res.cloudinary.com/ll9equhn/image/upload/v1791530141/swayamkrushi/wiucyh179ols5xikxett.jpg',
      caption: 'Assorted eco-friendly jute and cotton bags created by the students',
      alt: 'Handcrafted eco-friendly cotton and jute bags produced by Swayamkrushi trainees'
    }
  ],
  'story-tailoring': [
    {
      url: 'https://res.cloudinary.com/ll9equhn/image/upload/v1791530115/swayamkrushi/pnui7ub8rucjkivunlmr.jpg',
      caption: 'Y Lalitha Kumari guiding special students at the sewing machines',
      alt: 'Y Lalitha Kumari guiding special students at the sewing machines in Swayamkrushi'
    },
    {
      url: 'https://res.cloudinary.com/ll9equhn/image/upload/v1791530141/swayamkrushi/wiucyh179ols5xikxett.jpg',
      caption: 'Assorted eco-friendly jute and cotton bags created by the students',
      alt: 'Handcrafted eco-friendly cotton and jute bags produced by Swayamkrushi trainees'
    }
  ]
}


export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, committee, mediabuzz, articles, accolades, certificates, faqs, inquiries, settings

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Dashboard Stats
  const [stats, setStats] = useState({ articles: 0, accolades: 0, certificates: 0, faqs: 0, inquiries: 0, unreadInquiries: 0, committee: 0, mediaBuzz: 0 })

  // Data states
  const [articles, setArticles] = useState([])
  const [committeeMembers, setCommitteeMembers] = useState([])
  const [mediaBuzzItems, setMediaBuzzItems] = useState([])
  const [accolades, setAccolades] = useState({ featured: null, timeline: [] })
  const [certificates, setCertificates] = useState([])
  const [eventImages, setEventImages] = useState([])
  const [faqs, setFaqs] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [settings, setSettings] = useState({
    orgName: '',
    tagline: '',
    phone1: '',
    phone2: '',
    email: '',
    address: '',
    regNo: '',
    founderQuote: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  })

  // Loading & Filter states
  const [loading, setLoading] = useState(false)
  const [articleSectionFilter, setArticleSectionFilter] = useState('all')
  const [committeeCategoryFilter, setCommitteeCategoryFilter] = useState('all')
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal / Form states
  const [editingArticle, setEditingArticle] = useState(null)
  const [articleForm, setArticleForm] = useState({
    id: '',
    title: '',
    excerpt: '',
    paragraphs: [''],
    category: 'Stories & Milestones',
    section: 'main',
    attribution: 'Swayamkrushi Archives',
    imageUrl: '',
    imageAlt: '',
    images: [],
    featured: false,
    order: 0,
    videoUrl: '',
    videoThumbnailUrl: '',
    videoPosterUrl: '',
    videoPlacement: 'top',
    videoSize: 'big',
    mediaType: 'text'
  })
  const [uploadingStoryImage, setUploadingStoryImage] = useState(false)

  const [editingCommitteeMember, setEditingCommitteeMember] = useState(null)
  const [showCommitteeModal, setShowCommitteeModal] = useState(false)
  const [committeeForm, setCommitteeForm] = useState({
    id: '',
    name: '',
    role: 'Executive Member',
    roleCategory: 'Executive',
    designation: '',
    credentials: '',
    badge: 'EXECUTIVE MEMBER',
    colorTheme: 'burgundy',
    image: '',
    bio: '',
    tags: '',
    initials: '',
    order: 0
  })

  const [editingMediaBuzz, setEditingMediaBuzz] = useState(null)
  const [showMediaBuzzModal, setShowMediaBuzzModal] = useState(false)
  const [mediaBuzzForm, setMediaBuzzForm] = useState({
    id: '',
    title: '',
    outlet: '',
    outletType: 'Print & Newspapers',
    date: '',
    category: 'General Coverage',
    badge: 'MEDIA SPOTLIGHT',
    image: '',
    isClipping: false,
    excerpt: '',
    readTime: 'Read Report',
    tags: '',
    articleUrl: '',
    shareUrl: '',
    featured: false,
    order: 0
  })

  const [editingAccolade, setEditingAccolade] = useState(null)
  const [accoladeForm, setAccoladeForm] = useState({
    id: '',
    year: '',
    title: '',
    presenter: '',
    presentedBy: '',
    badge: '',
    shortDesc: '',
    fullDesc: '',
    imageUrl: '',
    imageLabel: '',
    isFeatured: false,
    order: 0
  })

  const [certificateForm, setCertificateForm] = useState({
    title: '',
    caption: '',
    year: '',
    imageUrl: '',
    order: 0
  })

  const [eventForm, setEventForm] = useState({
    title: '',
    caption: '',
    imageUrl: '',
    order: 0
  })

  const [editingFaq, setEditingFaq] = useState(null)
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0
  })

  const [uploadingImage, setUploadingImage] = useState(false)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [showAccoladeModal, setShowAccoladeModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showFaqModal, setShowFaqModal] = useState(false)

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 4000)
  }

  // Check auth session
  useEffect(() => {
    const token = localStorage.getItem('swayamkrushi_admin_token')
    if (token) {
      setIsAuthenticated(true)
      loadInitialData()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await adminLogin(passwordInput)
      if (res.success) {
        localStorage.setItem('swayamkrushi_admin_token', res.token)
        setIsAuthenticated(true)
        showNotification('Welcome to Swayamkrushi Admin CMS!')
        loadInitialData()
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid passcode')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('swayamkrushi_admin_token')
    setIsAuthenticated(false)
    setPasswordInput('')
  }

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [statsData, settingsData, articlesData, accoladesData, faqsData, inqData, certsData, committeeData, mediaData, eventsData] = await Promise.all([
        fetchAdminStats(),
        fetchSettings(),
        fetchArticles({ forceFresh: true }),
        fetchAccolades(),
        fetchFaqs(),
        fetchInquiries(),
        fetchCertificates(),
        fetchCommitteeMembers(),
        fetchMediaBuzz(),
        fetchEventImages()
      ])
      if (statsData) setStats(statsData)
      if (settingsData) setSettings(settingsData)
      if (articlesData) setArticles(articlesData)
      if (eventsData && Array.isArray(eventsData)) setEventImages(eventsData)
      if (accoladesData) {
        setAccolades({
          featured: accoladesData.featured,
          timeline: accoladesData.timeline || []
        })
      }
      if (certsData && certsData.length) {
        setCertificates(certsData)
      } else if (accoladesData?.certificates) {
        setCertificates(accoladesData.certificates)
      }
      if (faqsData) setFaqs(faqsData)
      if (inqData) setInquiries(inqData)

      // Committee
      if (Array.isArray(committeeData) && committeeData.length > 0) {
        setCommitteeMembers(committeeData)
      } else {
        const fallbackCommittee = DEFAULT_COMMITTEE_MEMBERS.filter((m) => !isIdDeleted('committee', m.id))
        setCommitteeMembers(fallbackCommittee)
      }

      // Media Buzz
      if (Array.isArray(mediaData) && mediaData.length > 0) {
        setMediaBuzzItems(mediaData)
      } else {
        const fallbackMedia = DEFAULT_MEDIA_ARTICLES.filter((a) => !isIdDeleted('media_buzz', a.id))
        setMediaBuzzItems(fallbackMedia)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      showNotification('Error loading initial data: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ─── CLOUDINARY IMAGE UPLOAD HELPER ──────────────────────────────────────
  const handleFileUpload = async (e, targetSetter, fieldName = 'imageUrl') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const uploadedUrl = await uploadImage(file)
      targetSetter((prev) => ({
        ...prev,
        [fieldName]: uploadedUrl
      }))
      showNotification('Image uploaded to Cloudinary successfully!')
    } catch (err) {
      showNotification('Image upload failed: ' + err.message, 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  // ─── ARTICLES ACTIONS ───────────────────────────────────────────────────
  const openNewArticleModal = () => {
    setEditingArticle(null)
    setArticleForm({
      id: '',
      title: '',
      excerpt: '',
      paragraphs: [''],
      category: 'Stories & Milestones',
      section: 'main',
      attribution: 'Swayamkrushi Archives',
      imageUrl: '',
      imageAlt: '',
      images: [],
      featured: false,
      order: articles.length + 1
    })
    setShowArticleModal(true)
  }

  const openEditArticleModal = (art) => {
    setEditingArticle(art)
    let initialHtml = art.contentHtml || ''
    if (!initialHtml && art.paragraphs && art.paragraphs.length) {
      initialHtml = art.paragraphs.map((p) => `<p>${p}</p>`).join('')
    }

    let initialImages = []
    if (Array.isArray(art.images)) {
      initialImages = art.images.map((img) => ({
        url: typeof img === 'string' ? img : (img.url || ''),
        caption: typeof img === 'object' ? (img.caption || img.alt || '') : '',
        alt: typeof img === 'object' ? (img.alt || img.caption || '') : '',
        placement: typeof img === 'object' ? (img.placement || 'left') : 'left',
        size: typeof img === 'object' ? (img.size || 'small') : 'small'
      })).filter((img) => img.url && img.url.length > 0)
    }

    // Inspect contentHtml to enrich placement / size / captions, or ONLY populate if art.images was NOT defined
    if (initialHtml) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(initialHtml, 'text/html')
      
      const figures = Array.from(doc.querySelectorAll('figure'))
      figures.forEach((fig) => {
        const imgEl = fig.querySelector('img')
        const figcap = fig.querySelector('figcaption')
        const src = imgEl?.getAttribute('src')?.trim()
        if (src) {
          const existing = initialImages.find((x) => isSameImage(x.url, src))
          const captionText = figcap?.textContent?.trim() || imgEl?.getAttribute('alt')?.trim() || ''
          const figurePlacement = fig.classList.contains('float-right')
            ? 'right'
            : fig.classList.contains('float-center')
            ? 'center'
            : 'left'
          const figureSize = fig.classList.contains('size-big') ? 'big' : 'small'

          if (existing) {
            if (!existing.caption && captionText) existing.caption = captionText
            if (!existing.placement || existing.placement === 'left') existing.placement = figurePlacement
            if (!existing.size) existing.size = figureSize
          } else if (!Array.isArray(art.images)) {
            // ONLY if art.images was NOT already an array, add it from legacy HTML
            initialImages.push({
              url: src,
              caption: captionText,
              alt: imgEl?.getAttribute('alt')?.trim() || captionText,
              placement: figurePlacement,
              size: figureSize
            })
          }
        }
      })

      if (!Array.isArray(art.images)) {
        const standaloneImgs = Array.from(doc.querySelectorAll('img'))
        standaloneImgs.forEach((imgEl) => {
          if (imgEl.closest('figure')) return
          const src = imgEl.getAttribute('src')?.trim()
          if (src) {
            const existing = initialImages.find((x) => isSameImage(x.url, src))
            const altText = imgEl.getAttribute('alt')?.trim() || imgEl.getAttribute('title')?.trim() || ''
            if (!existing) {
              initialImages.push({
                url: src,
                caption: altText,
                alt: altText,
                placement: 'left',
                size: 'small'
              })
            }
          }
        })
      }
    }

    // Only fallback to defaults if art.images was NEVER defined (undefined / null)
    if (art.images === undefined && initialImages.length === 0 && !initialHtml) {
      const defaultImgs = DEFAULT_ARTICLE_IMAGES[art.id] || DEFAULT_ARTICLE_IMAGES[art._id]
      if (Array.isArray(defaultImgs) && defaultImgs.length > 0) {
        initialImages = defaultImgs.map((img) => ({
          ...img,
          placement: img.placement || 'left',
          size: img.size || 'small'
        }))
      }
    }

    setArticleForm({
      id: art.id,
      title: art.title || '',
      excerpt: art.excerpt || '',
      contentHtml: initialHtml,
      paragraphs: art.paragraphs && art.paragraphs.length ? art.paragraphs : [''],
      category: art.category || 'Stories & Milestones',
      section: art.section || 'main',
      attribution: art.attribution || 'Swayamkrushi Archives',
      imageUrl: art.imageUrl || '',
      imageAlt: art.imageAlt !== undefined
        ? (art.imageAlt || '')
        : (DEFAULT_ARTICLE_CAPTIONS[art.id] || DEFAULT_ARTICLE_CAPTIONS[art._id] || ''),
      images: initialImages,
      featured: !!art.featured,
      order: art.order || 0,
      videoUrl: art.videoUrl || '',
      videoThumbnailUrl: art.videoThumbnailUrl || art.videoPosterUrl || '',
      videoPosterUrl: art.videoPosterUrl || art.videoThumbnailUrl || '',
      videoPlacement: art.videoPlacement || 'top',
      videoSize: art.videoSize || 'big',
      mediaType: art.videoUrl ? 'video' : (art.mediaType || 'text')
    })
    setShowArticleModal(true)
  }

  const handleUpdateStoryImageCaption = (index, newCaption) => {
    setArticleForm((prev) => {
      const nextImages = [...(prev.images || [])]
      if (nextImages[index]) {
        nextImages[index] = { ...nextImages[index], caption: newCaption }
      }
      return { ...prev, images: nextImages }
    })
  }

  const handleUpdateStoryImageProperty = (index, key, value) => {
    setArticleForm((prev) => {
      const nextImages = [...(prev.images || [])]
      if (nextImages[index]) {
        nextImages[index] = { ...nextImages[index], [key]: value }
      }
      return { ...prev, images: nextImages }
    })
  }

  const handleMoveStoryImage = (index, direction) => {
    setArticleForm((prev) => {
      const images = [...(prev.images || [])]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= images.length) return prev
      const temp = images[index]
      images[index] = images[targetIndex]
      images[targetIndex] = temp
      return { ...prev, images }
    })
  }

  const handleRemoveStoryImage = (index) => {
    setArticleForm((prev) => {
      const removedImg = (prev.images || [])[index]
      const removedUrl = typeof removedImg === 'string' ? removedImg : removedImg?.url
      const updatedImages = (prev.images || []).filter((_, i) => i !== index)

      // Scrub completely from contentHtml immediately so no ghost figure/caption remains
      let nextHtml = prev.contentHtml || ''
      if (nextHtml && removedUrl) {
        try {
          const parser = new DOMParser()
          const doc = parser.parseFromString(nextHtml, 'text/html')
          let changed = false

          // Remove any <figure> containing this image (which removes the image and its caption)
          const figures = Array.from(doc.querySelectorAll('figure'))
          figures.forEach((fig) => {
            const imgEl = fig.querySelector('img')
            const src = imgEl?.getAttribute('src')?.trim()
            if (src && (src === removedUrl || isSameImage(src, removedUrl))) {
              fig.remove()
              changed = true
            }
          })

          // Remove standalone <img>
          const imgs = Array.from(doc.querySelectorAll('img'))
          imgs.forEach((imgEl) => {
            const src = imgEl.getAttribute('src')?.trim()
            if (src && (src === removedUrl || isSameImage(src, removedUrl))) {
              const parent = imgEl.parentElement
              imgEl.remove()
              changed = true
              if (parent && (parent.tagName === 'P' || parent.tagName === 'DIV')) {
                if (!parent.textContent?.trim() && parent.children.length === 0) {
                  parent.remove()
                }
              }
            }
          })

          // Remove orphan figcaptions
          Array.from(doc.querySelectorAll('figcaption')).forEach((fc) => {
            if (!fc.closest('figure')) {
              fc.remove()
              changed = true
            }
          })

          if (changed) {
            nextHtml = doc.body.innerHTML
          }
        } catch (err) {
          console.error('Error stripping removed image from contentHtml:', err)
        }
      }

      return {
        ...prev,
        images: updatedImages,
        contentHtml: nextHtml
      }
    })

    // Permanently remove from Cloudinary if hosted there
    const removedImg = (articleForm.images || [])[index]
    const removedUrl = typeof removedImg === 'string' ? removedImg : removedImg?.url
    if (removedUrl && removedUrl.includes('cloudinary.com')) {
      deleteMediaFromCloudinary(removedUrl).catch((err) =>
        console.error('Failed to delete removed image from Cloudinary:', err)
      )
    }

    showNotification('Photo permanently deleted from article and Cloudinary.')
  }

  const handleUploadStoryImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingStoryImage(true)
    try {
      const url = await uploadImage(file)
      setArticleForm((prev) => ({
        ...prev,
        images: [
          ...(prev.images || []),
          { url, caption: '', alt: '', placement: 'left', size: 'small' }
        ]
      }))
      showNotification('Story photo added! You can now write its caption and set placement/size.')
    } catch (err) {
      showNotification('Failed to upload image: ' + err.message, 'error')
    } finally {
      setUploadingStoryImage(false)
      e.target.value = ''
    }
  }

  const handleAddStoryImageUrl = () => {
    const url = window.prompt('Enter Image URL (e.g. Cloudinary or web link):')
    if (url && url.trim()) {
      setArticleForm((prev) => ({
        ...prev,
        images: [
          ...(prev.images || []),
          { url: url.trim(), caption: '', alt: '', placement: 'left', size: 'small' }
        ]
      }))
    }
  }

  const handleEditStoryImageUrl = (index) => {
    const currentUrl = articleForm.images?.[index]?.url || ''
    const next = window.prompt('Edit Image URL:', currentUrl)
    if (next !== null && next.trim()) {
      setArticleForm((prev) => {
        const nextImages = [...(prev.images || [])]
        if (nextImages[index]) {
          nextImages[index] = { ...nextImages[index], url: next.trim() }
        }
        return { ...prev, images: nextImages }
      })
    }
  }

  const handleArticleParagraphChange = (index, value) => {
    const updated = [...articleForm.paragraphs]
    updated[index] = value
    setArticleForm({ ...articleForm, paragraphs: updated })
  }

  const addArticleParagraph = () => {
    setArticleForm({ ...articleForm, paragraphs: [...articleForm.paragraphs, ''] })
  }

  const removeArticleParagraph = (index) => {
    if (articleForm.paragraphs.length <= 1) return
    const updated = articleForm.paragraphs.filter((_, i) => i !== index)
    setArticleForm({ ...articleForm, paragraphs: updated })
  }

  const handleSaveArticle = async (e) => {
    e.preventDefault()
    try {
      const cleanedImages = (articleForm.images || []).map((img) => ({
        url: typeof img === 'string' ? img.trim() : (img.url || '').trim(),
        caption: typeof img === 'object' ? (img.caption || '').trim() : '',
        alt: typeof img === 'object' ? (img.alt || img.caption || '').trim() : '',
        placement: typeof img === 'object' ? (img.placement || 'left') : 'left',
        size: typeof img === 'object' ? (img.size || 'small') : 'small'
      })).filter((img) => img.url.length > 0)

      let finalContentHtml = articleForm.contentHtml || ''
      if (finalContentHtml) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(finalContentHtml, 'text/html')
        let changed = false

        // 1. Purge any figures or standalone images that are NOT in cleanedImages
        const figures = Array.from(doc.querySelectorAll('figure'))
        figures.forEach((fig) => {
          const imgEl = fig.querySelector('img')
          const src = imgEl?.getAttribute('src')?.trim()
          if (!src) {
            fig.remove()
            changed = true
            return
          }
          const matched = cleanedImages.find((imgObj) => isSameImage(imgObj.url, src))
          if (!matched) {
            fig.remove()
            changed = true
          }
        })

        const standaloneImgs = Array.from(doc.querySelectorAll('img'))
        standaloneImgs.forEach((imgEl) => {
          if (imgEl.closest('figure')) return
          const src = imgEl.getAttribute('src')?.trim()
          if (!src) {
            imgEl.remove()
            changed = true
            return
          }
          const matched = cleanedImages.find((imgObj) => isSameImage(imgObj.url, src))
          if (!matched) {
            const parent = imgEl.parentElement
            imgEl.remove()
            changed = true
            if (parent && (parent.tagName === 'P' || parent.tagName === 'DIV')) {
              if (!parent.textContent?.trim() && parent.children.length === 0) {
                parent.remove()
              }
            }
          }
        })

        // Remove orphan figcaptions
        Array.from(doc.querySelectorAll('figcaption')).forEach((fc) => {
          if (!fc.closest('figure')) {
            fc.remove()
            changed = true
          }
        })

        // 2. Sync captions, placement and size classes for remaining images
        cleanedImages.forEach((imgObj) => {
          const targetCaption = imgObj.caption || ''
          const alignClass = imgObj.placement === 'right' ? 'float-right' : imgObj.placement === 'center' ? 'float-center' : 'float-left'
          const sizeClass = imgObj.size === 'big' ? 'size-big' : 'size-small'

          Array.from(doc.querySelectorAll('figure')).forEach((fig) => {
            const imgEl = fig.querySelector('img')
            const src = imgEl?.getAttribute('src')?.trim()
            if (src && isSameImage(src, imgObj.url)) {
              fig.className = `article-inline-figure ${alignClass} ${sizeClass}`
              let figcap = fig.querySelector('figcaption')
              if (targetCaption) {
                if (!figcap) {
                  figcap = doc.createElement('figcaption')
                  fig.appendChild(figcap)
                }
                figcap.className = 'article-inline-caption'
                figcap.textContent = targetCaption
              } else if (figcap) {
                figcap.remove()
              }
              imgEl.setAttribute('alt', targetCaption || imgObj.alt || '')
              changed = true
            }
          })

          Array.from(doc.querySelectorAll('img')).forEach((imgEl) => {
            if (imgEl.closest('figure')) return
            const src = imgEl.getAttribute('src')?.trim()
            if (src && isSameImage(src, imgObj.url)) {
              imgEl.setAttribute('alt', targetCaption || imgObj.alt || '')
              imgEl.setAttribute('title', targetCaption || imgObj.alt || '')
              changed = true
            }
          })
        })

        if (changed) {
          finalContentHtml = doc.body.innerHTML
        }
      }

      const hasVideo = Boolean(articleForm.videoUrl && articleForm.videoUrl.trim().length > 0)
      const cleanedPayload = {
        ...articleForm,
        contentHtml: finalContentHtml,
        paragraphs: articleForm.paragraphs.filter((p) => p.trim().length > 0),
        images: cleanedImages,
        imageAlt: articleForm.imageAlt || '',
        videoUrl: articleForm.videoUrl ? articleForm.videoUrl.trim() : '',
        videoThumbnailUrl: articleForm.videoThumbnailUrl ? articleForm.videoThumbnailUrl.trim() : '',
        videoPosterUrl: articleForm.videoPosterUrl ? articleForm.videoPosterUrl.trim() : '',
        videoPlacement: articleForm.videoPlacement || 'top',
        videoSize: articleForm.videoSize || 'big',
        mediaType: hasVideo ? 'video' : (articleForm.mediaType || 'text'),
        featuredMediaType: hasVideo ? 'video' : (cleanedImages.length > 0 || articleForm.imageUrl ? 'image' : 'text')
      }

      if (editingArticle) {
        await updateArticle(editingArticle.id || editingArticle._id, cleanedPayload)
        showNotification('Article updated successfully!')
      } else {
        await createArticle(cleanedPayload)
        showNotification('New article published successfully!')
      }
      setShowArticleModal(false)
      const refreshed = await fetchArticles()
      if (refreshed) setArticles(refreshed)
      const st = await fetchAdminStats()
      if (st) setStats(st)
    } catch (err) {
      showNotification('Failed to save article: ' + err.message, 'error')
    }
  }

  const handleDeleteArticle = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete article "${title}"?`)) return
    try {
      const artToDelete = articles.find((a) => a.id === id || a._id === id)
      await deleteArticle(id)
      showNotification('Article deleted successfully')
      setArticles((prev) => prev.filter((a) => a.id !== id && a._id !== id))
      const st = await fetchAdminStats()
      if (st) setStats(st)

      // Purge any Cloudinary assets
      if (artToDelete) {
        const toDeleteUrls = []
        if (artToDelete.imageUrl) toDeleteUrls.push(artToDelete.imageUrl)
        if (artToDelete.videoUrl) toDeleteUrls.push({ url: artToDelete.videoUrl, type: 'video' })
        if (artToDelete.videoThumbnailUrl) toDeleteUrls.push(artToDelete.videoThumbnailUrl)
        if (artToDelete.videoPosterUrl) toDeleteUrls.push(artToDelete.videoPosterUrl)
        if (Array.isArray(artToDelete.images)) {
          artToDelete.images.forEach((img) => {
            const u = typeof img === 'string' ? img : img?.url
            if (u) toDeleteUrls.push(u)
          })
        }
        for (const item of toDeleteUrls) {
          const u = typeof item === 'string' ? item : item.url
          const t = typeof item === 'object' ? item.type : 'image'
          if (u && u.includes('cloudinary.com')) {
            deleteMediaFromCloudinary(u, t).catch((e) =>
              console.error('Failed to delete media from Cloudinary on article deletion:', e)
            )
          }
        }
      }
    } catch (err) {
      showNotification('Failed to delete article: ' + err.message, 'error')
    }
  }

  // ─── MANAGING COMMITTEE ACTIONS ──────────────────────────────────────────
  const openNewCommitteeModal = () => {
    setEditingCommitteeMember(null)
    setCommitteeForm({
      id: '',
      name: '',
      role: 'Executive Member',
      roleCategory: 'Executive',
      designation: '',
      credentials: '',
      badge: 'EXECUTIVE MEMBER',
      colorTheme: 'burgundy',
      image: '',
      bio: '',
      tags: '',
      initials: '',
      order: committeeMembers.length + 1
    })
    setShowCommitteeModal(true)
  }

  const openEditCommitteeModal = (member) => {
    setEditingCommitteeMember(member)
    setCommitteeForm({
      id: member.id || member._id || '',
      name: member.name || '',
      role: member.role || '',
      roleCategory: member.roleCategory || 'General',
      designation: member.designation || '',
      credentials: member.credentials || '',
      badge: member.badge || '',
      colorTheme: member.colorTheme || 'burgundy',
      image: member.image || '',
      bio: member.bio || '',
      tags: Array.isArray(member.tags) ? member.tags.join(', ') : (member.tags || ''),
      initials: member.initials || '',
      order: member.order || 0
    })
    setShowCommitteeModal(true)
  }

  const handleSaveCommittee = async (e) => {
    e.preventDefault()
    try {
      const parsedTags = typeof committeeForm.tags === 'string'
        ? committeeForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : (committeeForm.tags || [])

      const initials = committeeForm.initials || committeeForm.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

      const payload = {
        ...committeeForm,
        tags: parsedTags,
        initials
      }

      if (editingCommitteeMember) {
        await updateCommitteeMember(editingCommitteeMember.id || editingCommitteeMember._id, payload)
        showNotification(`Committee member "${payload.name}" updated successfully!`)
      } else {
        await createCommitteeMember(payload)
        showNotification(`New committee member "${payload.name}" added successfully!`)
      }
      setShowCommitteeModal(false)
      const refreshed = await fetchCommitteeMembers()
      if (refreshed) setCommitteeMembers(refreshed)
      const st = await fetchAdminStats()
      if (st) setStats(st)
    } catch (err) {
      showNotification('Failed to save committee member: ' + err.message, 'error')
    }
  }

  const handleDeleteCommittee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the Managing Committee?`)) return
    try {
      await deleteCommitteeMember(id)
      showNotification(`Committee member "${name}" removed.`)
      setCommitteeMembers((prev) => prev.filter((m) => m.id !== id && m._id !== id))
      const st = await fetchAdminStats()
      if (st) setStats(st)
    } catch (err) {
      showNotification('Failed to remove committee member: ' + err.message, 'error')
    }
  }

  // ─── MEDIA BUZZ & PRESS ACTIONS ──────────────────────────────────────────
  const openNewMediaBuzzModal = () => {
    setEditingMediaBuzz(null)
    setMediaBuzzForm({
      id: '',
      title: '',
      outlet: '',
      outletType: 'Print & Newspapers',
      date: '',
      category: 'General Coverage',
      badge: 'MEDIA SPOTLIGHT',
      image: '',
      isClipping: false,
      excerpt: '',
      readTime: 'Read Report',
      tags: '',
      articleUrl: '',
      shareUrl: '',
      featured: false,
      order: mediaBuzzItems.length + 1
    })
    setShowMediaBuzzModal(true)
  }

  const openEditMediaBuzzModal = (item) => {
    setEditingMediaBuzz(item)
    setMediaBuzzForm({
      id: item.id || item._id || '',
      title: item.title || '',
      outlet: item.outlet || '',
      outletType: item.outletType || 'Print & Newspapers',
      date: item.date || '',
      category: item.category || '',
      badge: item.badge || '',
      image: item.image || '',
      isClipping: !!item.isClipping,
      excerpt: item.excerpt || '',
      readTime: item.readTime || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      articleUrl: item.articleUrl || '',
      shareUrl: item.shareUrl || '',
      featured: !!item.featured,
      order: item.order || 0
    })
    setShowMediaBuzzModal(true)
  }

  const handleSaveMediaBuzz = async (e) => {
    e.preventDefault()
    try {
      const parsedTags = typeof mediaBuzzForm.tags === 'string'
        ? mediaBuzzForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : (mediaBuzzForm.tags || [])

      const payload = {
        ...mediaBuzzForm,
        tags: parsedTags
      }

      if (editingMediaBuzz) {
        await updateMediaBuzz(editingMediaBuzz.id || editingMediaBuzz._id, payload)
        showNotification(`Media article "${payload.title}" updated successfully!`)
      } else {
        await createMediaBuzz(payload)
        showNotification(`New media article "${payload.title}" published!`)
      }
      setShowMediaBuzzModal(false)
      const refreshed = await fetchMediaBuzz()
      if (refreshed) setMediaBuzzItems(refreshed)
      const st = await fetchAdminStats()
      if (st) setStats(st)
    } catch (err) {
      showNotification('Failed to save media article: ' + err.message, 'error')
    }
  }

  const handleDeleteMediaBuzz = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete media article "${title}"?`)) return
    try {
      await deleteMediaBuzz(id)
      showNotification('Media article deleted.')
      setMediaBuzzItems((prev) => prev.filter((a) => a.id !== id && a._id !== id))
      const st = await fetchAdminStats()
      if (st) setStats(st)
    } catch (err) {
      showNotification('Failed to delete media article: ' + err.message, 'error')
    }
  }

  const handleToggleFeaturedBuzz = async (item) => {
    try {
      const updated = { ...item, featured: !item.featured }
      await updateMediaBuzz(item.id || item._id, updated)
      setMediaBuzzItems((prev) =>
        prev.map((a) => (a.id === item.id || a._id === item._id ? updated : a))
      )
      showNotification(`Toggled featured status for "${item.title}"`)
    } catch (err) {
      showNotification('Failed to update featured status: ' + err.message, 'error')
    }
  }
  const openNewAccoladeModal = () => {
    setEditingAccolade(null)
    setAccoladeForm({
      id: '',
      year: new Date().getFullYear().toString(),
      title: '',
      presenter: '',
      presentedBy: '',
      badge: '',
      shortDesc: '',
      fullDesc: '',
      imageUrl: '',
      imageLabel: '',
      isFeatured: false,
      order: accolades.timeline.length + 1
    })
    setShowAccoladeModal(true)
  }

  const openEditAccoladeModal = (acc) => {
    setEditingAccolade(acc)
    setAccoladeForm({
      id: acc.id,
      year: acc.year || '',
      title: acc.title || '',
      presenter: acc.presenter || '',
      presentedBy: acc.presentedBy || '',
      badge: acc.badge || '',
      shortDesc: acc.shortDesc || '',
      fullDesc: acc.fullDesc || '',
      imageUrl: acc.imageUrl || '',
      imageLabel: acc.imageLabel || '',
      isFeatured: !!acc.isFeatured,
      order: acc.order || 0
    })
    setShowAccoladeModal(true)
  }

  const handleSaveAccolade = async (e) => {
    e.preventDefault()
    try {
      if (editingAccolade) {
        await updateAccolade(editingAccolade.id, accoladeForm)
        showNotification('Accolade updated successfully!')
      } else {
        await createAccolade(accoladeForm)
        showNotification('Accolade added successfully!')
      }
      setShowAccoladeModal(false)
      const refreshed = await fetchAccolades()
      if (refreshed) {
        setAccolades({
          featured: refreshed.featured,
          timeline: refreshed.timeline || []
        })
      }
    } catch (err) {
      showNotification('Failed to save accolade: ' + err.message, 'error')
    }
  }

  const handleDeleteAccolade = async (id, title) => {
    if (!window.confirm(`Delete recognition milestone "${title}"?`)) return
    try {
      await deleteAccolade(id)
      showNotification('Accolade deleted successfully')
      const refreshed = await fetchAccolades()
      if (refreshed) {
        setAccolades({
          featured: refreshed.featured,
          timeline: refreshed.timeline || []
        })
      }
    } catch (err) {
      showNotification('Failed to delete accolade: ' + err.message, 'error')
    }
  }

  // ─── CERTIFICATES ACTIONS ───────────────────────────────────────────────
  const handleSaveCertificate = async (e) => {
    e.preventDefault()
    try {
      await createCertificate(certificateForm)
      showNotification('Certificate uploaded and added successfully!')
      setShowCertModal(false)
      setCertificateForm({ title: '', caption: '', year: '', imageUrl: '', order: 0 })
      const certs = await fetchCertificates()
      setCertificates(certs)
    } catch (err) {
      showNotification('Failed to add certificate: ' + err.message, 'error')
    }
  }

  const handleDeleteCert = async (id, title) => {
    if (!window.confirm(`Delete certificate "${title}"?`)) return
    try {
      await deleteCertificate(id)
      showNotification('Certificate deleted')
      setCertificates((prev) => prev.filter((c) => c._id !== id && c.id !== id))
    } catch (err) {
      showNotification('Failed to delete certificate: ' + err.message, 'error')
    }
  }

  // ─── EVENT IMAGES ACTIONS ────────────────────────────────────────────────
  const handleSaveEventImage = async (e) => {
    e.preventDefault()
    if (!eventForm.imageUrl) {
      showNotification('Please upload an image or provide an image URL', 'error')
      return
    }
    try {
      await createEventImage(eventForm)
      showNotification('Event image added successfully!')
      setShowEventModal(false)
      setEventForm({ title: '', caption: '', imageUrl: '', order: 0 })
      const data = await fetchEventImages()
      setEventImages(data)
    } catch (err) {
      showNotification('Failed to add event image: ' + err.message, 'error')
    }
  }

  const handleDeleteEventImage = async (id, title) => {
    if (!window.confirm(`Delete this event image?`)) return
    try {
      await deleteEventImage(id)
      showNotification('Event image deleted')
      setEventImages((prev) => prev.filter((item) => item._id !== id && item.id !== id))
    } catch (err) {
      showNotification('Failed to delete event image: ' + err.message, 'error')
    }
  }

  // ─── FAQ ACTIONS ────────────────────────────────────────────────────────
  const openNewFaqModal = () => {
    setEditingFaq(null)
    setFaqForm({ question: '', answer: '', category: 'General', order: faqs.length + 1 })
    setShowFaqModal(true)
  }

  const openEditFaqModal = (faq) => {
    setEditingFaq(faq)
    setFaqForm({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      order: faq.order || 0
    })
    setShowFaqModal(true)
  }

  const handleSaveFaq = async (e) => {
    e.preventDefault()
    try {
      if (editingFaq) {
        await updateFaq(editingFaq._id, faqForm)
        showNotification('FAQ updated successfully!')
      } else {
        await createFaq(faqForm)
        showNotification('New FAQ added!')
      }
      setShowFaqModal(false)
      const refreshed = await fetchFaqs()
      if (refreshed) setFaqs(refreshed)
    } catch (err) {
      showNotification('Failed to save FAQ: ' + err.message, 'error')
    }
  }

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return
    try {
      await deleteFaq(id)
      showNotification('FAQ deleted successfully')
      setFaqs((prev) => prev.filter((f) => f._id !== id))
    } catch (err) {
      showNotification('Failed to delete FAQ: ' + err.message, 'error')
    }
  }

  // ─── INQUIRIES ACTIONS ──────────────────────────────────────────────────
  const handleToggleInquiryStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'read' ? 'pending' : 'read'
      await updateInquiryStatus(id, nextStatus)
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: nextStatus } : inq))
      )
      showNotification(`Marked inquiry as ${nextStatus}`)
      const st = await fetchAdminStats()
      if (st) setStats(st)
    } catch (err) {
      showNotification('Failed to update status: ' + err.message, 'error')
    }
  }

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry message?')) return
    try {
      await deleteInquiry(id)
      setInquiries((prev) => prev.filter((inq) => inq._id !== id))
      showNotification('Inquiry deleted')
      const st = await fetchAdminStats()
      if (st) setStats(st)
    } catch (err) {
      showNotification('Failed to delete inquiry: ' + err.message, 'error')
    }
  }

  // ─── CMS SETTINGS ACTIONS ────────────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      const updated = await updateSettings(settings)
      setSettings(updated)
      showNotification('Website CMS & Contact settings saved successfully!')
    } catch (err) {
      showNotification('Failed to save settings: ' + err.message, 'error')
    }
  }

  // Filtered articles list
  const filteredArticles = articles.filter((art) => {
    const matchesSection = articleSectionFilter === 'all' || art.section === articleSectionFilter
    const matchesSearch =
      !searchQuery ||
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSection && matchesSearch
  })

  // Filtered committee members list
  const filteredCommitteeMembers = committeeMembers.filter((m) => {
    const matchCat =
      committeeCategoryFilter === 'all' ||
      (committeeCategoryFilter === 'founder' && (m.roleCategory === 'Founder' || m.roleCategory === 'Patron')) ||
      (committeeCategoryFilter === 'presidency' && m.roleCategory === 'Presidency') ||
      (committeeCategoryFilter === 'secretariat' && m.roleCategory === 'Secretariat') ||
      (committeeCategoryFilter === 'executive' && m.roleCategory === 'Executive') ||
      (m.roleCategory === committeeCategoryFilter)
    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      (m.designation && m.designation.toLowerCase().includes(q)) ||
      (m.credentials && m.credentials.toLowerCase().includes(q)) ||
      (m.bio && m.bio.toLowerCase().includes(q))
    return matchCat && matchSearch
  })

  // Filtered media buzz list
  const filteredMediaBuzzItems = mediaBuzzItems.filter((a) => {
    const matchType =
      mediaTypeFilter === 'all' ||
      (mediaTypeFilter === 'print' && a.outletType === 'Print & Newspapers') ||
      (mediaTypeFilter === 'digital' && a.outletType === 'Digital & Magazines')
    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.outlet && a.outlet.toLowerCase().includes(q)) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
      (a.badge && a.badge.toLowerCase().includes(q))
    return matchType && matchSearch
  })

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="admin-page admin-login-wrapper" role="main" aria-label="Admin Login">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-stamp">ADMIN PORTAL</span>
            <h1 className="admin-login-title">Swayamkrushi CMS</h1>
            <p className="admin-login-subtitle">
              Manage articles, media, awards, website settings & contact inquiries.
            </p>
          </div>

          {authError && <div className="admin-alert admin-alert-error">{authError}</div>}

          <form onSubmit={handleLogin} className="admin-form">
            <div className="admin-form-group">
              <label htmlFor="adminPass">Admin Access Passcode</label>
              <input
                id="adminPass"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter passcode (default: swayamkrushi2026)"
                required
                className="admin-input"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="admin-btn admin-btn-primary admin-btn-block"
            >
              {authLoading ? 'Verifying Access...' : 'Unlock CMS Dashboard →'}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link to="/" className="admin-back-link">
              ← Return to Swayamkrushi Main Site
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ─── AUTHENTICATED DASHBOARD ─────────────────────────────────────────────
  return (
    <div className="admin-page admin-dashboard-layout">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Masthead Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <span className="admin-badge-live">LIVE CMS</span>
          <h2>SWAYAMKRUSHI MANAGEMENT CONSOLE</h2>
        </div>
        <div className="admin-topbar-actions">
          <Link to="/" className="admin-btn admin-btn-outline" target="_blank" rel="noreferrer">
            🌐 View Public Website ↗
          </Link>
          <button onClick={handleLogout} className="admin-btn admin-btn-danger-outline">
            Logout
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="admin-body">
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="admin-nav-icon">📊</span>
              <span>Overview & Stats</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'committee' ? 'active' : ''}`}
              onClick={() => setActiveTab('committee')}
            >
              <span className="admin-nav-icon">👥</span>
              <span>Managing Committee ({committeeMembers.length})</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'mediabuzz' ? 'active' : ''}`}
              onClick={() => setActiveTab('mediabuzz')}
            >
              <span className="admin-nav-icon">🗞️</span>
              <span>Media Buzz & Press ({mediaBuzzItems.length})</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'articles' ? 'active' : ''}`}
              onClick={() => setActiveTab('articles')}
            >
              <span className="admin-nav-icon">📰</span>
              <span>Articles & Stories ({articles.length})</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'accolades' ? 'active' : ''}`}
              onClick={() => setActiveTab('accolades')}
            >
              <span className="admin-nav-icon">🏆</span>
              <span>Accolades & Awards ({accolades.timeline.length + (accolades.featured ? 1 : 0)})</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'certificates' ? 'active' : ''}`}
              onClick={() => setActiveTab('certificates')}
            >
              <span className="admin-nav-icon">📜</span>
              <span>Certificates & Media ({certificates.length})</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <span className="admin-nav-icon">📷</span>
              <span>Events Gallery ({eventImages.length})</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'faqs' ? 'active' : ''}`}
              onClick={() => setActiveTab('faqs')}
            >
              <span className="admin-nav-icon">❓</span>
              <span>FAQs Manager ({faqs.length})</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'inquiries' ? 'active' : ''}`}
              onClick={() => setActiveTab('inquiries')}
            >
              <span className="admin-nav-icon">📬</span>
              <span>Messages & Inquiries ({inquiries.length})</span>
              {stats.unreadInquiries > 0 && (
                <span className="admin-counter-pill">{stats.unreadInquiries}</span>
              )}
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="admin-nav-icon">⚙️</span>
              <span>Website CMS Settings</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="admin-content-area">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Overview & Statistics</h1>
                  <p className="admin-section-desc">
                    Real-time status of content, media assets, committee governance, and incoming messages on Swayamkrushi.
                  </p>
                </div>
                <button onClick={loadInitialData} className="admin-btn admin-btn-secondary">
                  🔄 Refresh Data
                </button>
              </div>

              {/* Stats Grid */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card" onClick={() => setActiveTab('committee')}>
                  <div className="admin-stat-icon">👥</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-count">{committeeMembers.length}</span>
                    <span className="admin-stat-label">Committee Members</span>
                  </div>
                  <span className="admin-stat-action">Manage →</span>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('mediabuzz')}>
                  <div className="admin-stat-icon">🗞️</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-count">{mediaBuzzItems.length}</span>
                    <span className="admin-stat-label">Media & Press Items</span>
                  </div>
                  <span className="admin-stat-action">Manage →</span>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('articles')}>
                  <div className="admin-stat-icon">📰</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-count">{articles.length}</span>
                    <span className="admin-stat-label">Published Articles</span>
                  </div>
                  <span className="admin-stat-action">Manage →</span>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('accolades')}>
                  <div className="admin-stat-icon">🏆</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-count">
                      {accolades.timeline.length + (accolades.featured ? 1 : 0)}
                    </span>
                    <span className="admin-stat-label">Awards & Milestones</span>
                  </div>
                  <span className="admin-stat-action">Manage →</span>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('certificates')}>
                  <div className="admin-stat-icon">📜</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-count">{certificates.length}</span>
                    <span className="admin-stat-label">Certificates & Media</span>
                  </div>
                  <span className="admin-stat-action">Manage →</span>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('inquiries')}>
                  <div className="admin-stat-icon">📬</div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-count">{inquiries.length}</span>
                    <span className="admin-stat-label">Contact Messages</span>
                  </div>
                  <span className="admin-stat-action">View Inbox →</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="admin-quick-actions">
                <h2 className="admin-subsection-title">Quick Actions</h2>
                <div className="admin-actions-row">
                  <button onClick={openNewCommitteeModal} className="admin-btn admin-btn-primary">
                    👥 Add Committee Member
                  </button>
                  <button onClick={openNewMediaBuzzModal} className="admin-btn admin-btn-primary">
                    🗞️ Post Media Buzz
                  </button>
                  <button onClick={openNewArticleModal} className="admin-btn admin-btn-outline">
                    ✍️ Post New Article
                  </button>
                  <button onClick={openNewAccoladeModal} className="admin-btn admin-btn-outline">
                    🏆 Add Accolade / Award
                  </button>
                  <button
                    onClick={() => {
                      setCertificateForm({ title: '', caption: '', year: '', imageUrl: '', order: certificates.length + 1 })
                      setShowCertModal(true)
                    }}
                    className="admin-btn admin-btn-outline"
                  >
                    📜 Upload Certificate
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="admin-btn admin-btn-secondary">
                    ⚙️ Edit Contact & Site Info
                  </button>
                </div>
              </div>

              {/* Recent Inquiries Snippet */}
              <div className="admin-recent-block">
                <div className="admin-subhead-row">
                  <h2 className="admin-subsection-title">Recent Contact Inquiries</h2>
                  <button onClick={() => setActiveTab('inquiries')} className="admin-link-btn">
                    View All Messages ({inquiries.length}) →
                  </button>
                </div>
                {inquiries.length === 0 ? (
                  <p className="admin-empty-text">No messages received yet.</p>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Name</th>
                          <th>Email / Phone</th>
                          <th>Type</th>
                          <th>Message Preview</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.slice(0, 5).map((inq) => (
                          <tr key={inq._id}>
                            <td className="admin-nowrap">
                              {new Date(inq.createdAt).toLocaleDateString()}
                            </td>
                            <td><strong>{inq.name}</strong></td>
                            <td>
                              <div>{inq.email}</div>
                              {inq.phone && <small className="text-muted">{inq.phone}</small>}
                            </td>
                            <td>
                              <span className="admin-tag">{inq.type || 'General'}</span>
                            </td>
                            <td className="admin-truncate-text">{inq.message}</td>
                            <td>
                              <span className={`admin-badge-status ${inq.status === 'read' ? 'status-read' : 'status-pending'}`}>
                                {inq.status === 'read' ? '✓ Read' : '● New'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGING COMMITTEE MANAGER */}
          {activeTab === 'committee' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Managing Committee & Governance</h1>
                  <p className="admin-section-desc">
                    Add, edit, reorder, or remove members of the Managing Committee, Patron, and Executive Leadership.
                  </p>
                </div>
                <button onClick={openNewCommitteeModal} className="admin-btn admin-btn-primary">
                  👥 Add Committee Member
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div className="admin-filter-bar">
                <div className="admin-filter-group">
                  <label>Category:</label>
                  <select
                    value={committeeCategoryFilter}
                    onChange={(e) => setCommitteeCategoryFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">All Categories ({committeeMembers.length})</option>
                    <option value="founder">Founder & Patron</option>
                    <option value="presidency">Presidents & Vice Presidents</option>
                    <option value="secretariat">Secretariat</option>
                    <option value="executive">Executive Committee</option>
                  </select>
                </div>

                <div className="admin-search-group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, role, title, or bio..."
                    className="admin-input-search"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="admin-search-clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Committee Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Photo</th>
                      <th>Name & Role</th>
                      <th>Category & Badge</th>
                      <th>Designation & Credentials</th>
                      <th>Tags</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommitteeMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-empty-cell">
                          No committee members found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCommitteeMembers.map((member) => (
                        <tr key={member.id || member._id}>
                          <td>
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 6,
                                  background: '#6e1e38',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: 14
                                }}
                              >
                                {member.initials || 'SK'}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>{member.name}</strong>
                            <div style={{ fontSize: 12, color: '#6e1e38', fontWeight: 600 }}>
                              {member.role}
                            </div>
                          </td>
                          <td>
                            <span className="admin-tag" style={{ background: '#f5eff2', color: '#6e1e38', fontWeight: 700 }}>
                              {member.badge || member.roleCategory}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: 13 }}>{member.designation}</div>
                            {member.credentials && (
                              <div style={{ fontSize: 11, color: '#666' }}>{member.credentials}</div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
                              {(Array.isArray(member.tags) ? member.tags : (member.tags ? member.tags.split(',') : [])).map((t, idx) => (
                                <span key={idx} className="admin-tag" style={{ fontSize: 10 }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>{member.order || 0}</td>
                          <td>
                            <div className="admin-btn-group">
                              <button
                                onClick={() => openEditCommitteeModal(member)}
                                className="admin-btn-action admin-btn-edit"
                                title="Edit Member"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCommittee(member.id || member._id, member.name)}
                                className="admin-btn-action admin-btn-delete"
                                title="Delete Member"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA BUZZ & PRESS MANAGER */}
          {activeTab === 'mediabuzz' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Media Buzz & Press Manager</h1>
                  <p className="admin-section-desc">
                    Publish newspaper clippings, digital press features, interview highlights, and external media links.
                  </p>
                </div>
                <button onClick={openNewMediaBuzzModal} className="admin-btn admin-btn-primary">
                  🗞️ Post Media Story
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div className="admin-filter-bar">
                <div className="admin-filter-group">
                  <label>Type:</label>
                  <select
                    value={mediaTypeFilter}
                    onChange={(e) => setMediaTypeFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">All Coverage ({mediaBuzzItems.length})</option>
                    <option value="print">Print & Newspapers</option>
                    <option value="digital">Digital & Magazines</option>
                  </select>
                </div>

                <div className="admin-search-group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, outlet, or excerpt..."
                    className="admin-input-search"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="admin-search-clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Media Buzz Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Media</th>
                      <th>Headline & Outlet</th>
                      <th>Type & Category</th>
                      <th>Date / Format</th>
                      <th>Featured</th>
                      <th>Link</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMediaBuzzItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-empty-cell">
                          No media articles found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredMediaBuzzItems.map((article) => (
                        <tr key={article.id || article._id}>
                          <td>
                            {article.image ? (
                              <img
                                src={article.image}
                                alt={article.title}
                                style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                              />
                            ) : (
                              <span style={{ fontSize: 20 }}>📰</span>
                            )}
                          </td>
                          <td>
                            <strong>{article.title}</strong>
                            <div style={{ fontSize: 12, color: '#6e1e38', fontWeight: 600 }}>
                              {article.outlet} {article.isClipping && <span className="admin-tag" style={{ background: '#eef2ff', color: '#4338ca', fontSize: 10 }}>Clipping</span>}
                            </div>
                          </td>
                          <td>
                            <span className="admin-tag" style={{ background: '#f5eff2', color: '#6e1e38' }}>
                              {article.badge || article.outletType}
                            </span>
                          </td>
                          <td className="admin-nowrap">
                            <div>{article.date}</div>
                            {article.readTime && <small className="text-muted">{article.readTime}</small>}
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleFeaturedBuzz(article)}
                              className={`admin-btn-action ${article.featured ? 'admin-btn-edit' : 'admin-btn-outline'}`}
                              style={{ fontSize: 11, padding: '3px 8px' }}
                              title="Click to toggle Featured on Frontpage"
                            >
                              {article.featured ? '★ Featured' : '☆ Standard'}
                            </button>
                          </td>
                          <td>
                            {article.articleUrl ? (
                              <a
                                href={article.articleUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#6e1e38', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                              >
                                View ↗
                              </a>
                            ) : (
                              <span style={{ color: '#aaa', fontSize: 12 }}>—</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-btn-group">
                              <button
                                onClick={() => openEditMediaBuzzModal(article)}
                                className="admin-btn-action admin-btn-edit"
                                title="Edit Story"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMediaBuzz(article.id || article._id, article.title)}
                                className="admin-btn-action admin-btn-delete"
                                title="Delete Story"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ARTICLES & STORIES MANAGER */}
          {activeTab === 'articles' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Articles & News Editor</h1>
                  <p className="admin-section-desc">
                    Post, update, or remove stories, milestones, and columns displayed on the newspaper frontpage.
                  </p>
                </div>
                <button onClick={openNewArticleModal} className="admin-btn admin-btn-primary">
                  ✍️ Post New Article
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div className="admin-filter-bar">
                <div className="admin-filter-group">
                  <label>Section:</label>
                  <select
                    value={articleSectionFilter}
                    onChange={(e) => setArticleSectionFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">All Sections ({articles.length})</option>
                    <option value="left">Left Column (The Compass)</option>
                    <option value="main">Center / Main Headlines</option>
                    <option value="right">Right Column (The Chronicle)</option>
                    <option value="feature">Featured Highlights</option>
                  </select>
                </div>
                <div className="admin-search-group">
                  <input
                    type="text"
                    placeholder="Search articles by title or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-input admin-search-input"
                  />
                </div>
              </div>

              {/* Articles Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Img</th>
                      <th>Title & Excerpt</th>
                      <th>Category</th>
                      <th>Section</th>
                      <th>Attribution</th>
                      <th>Order</th>
                      <th style={{ width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-table-empty">
                          No articles found matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map((art) => (
                        <tr key={art.id || art._id}>
                          <td>
                            {art.imageUrl ? (
                              <img src={art.imageUrl} alt="" className="admin-table-thumb" />
                            ) : (
                              <div className="admin-table-thumb-placeholder">📰</div>
                            )}
                          </td>
                          <td>
                            <strong className="admin-item-title">{art.title}</strong>
                            <p className="admin-item-snippet">{art.excerpt}</p>
                            {(art.imageAlt || DEFAULT_ARTICLE_CAPTIONS[art.id] || DEFAULT_ARTICLE_CAPTIONS[art._id]) && (
                              <p style={{ fontSize: '11px', color: '#6e1e38', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                                <strong style={{ fontStyle: 'normal', color: '#444' }}>Caption: </strong>
                                "{art.imageAlt || DEFAULT_ARTICLE_CAPTIONS[art.id] || DEFAULT_ARTICLE_CAPTIONS[art._id]}"
                              </p>
                            )}
                            {art.featured && <span className="admin-badge-featured">★ FEATURED</span>}
                          </td>
                          <td><span className="admin-tag">{art.category}</span></td>
                          <td>
                            <span className="admin-section-pill">{art.section || 'main'}</span>
                          </td>
                          <td className="text-muted">{art.attribution}</td>
                          <td>{art.order}</td>
                          <td>
                            <div className="admin-btn-group">
                              <button
                                onClick={() => openEditArticleModal(art)}
                                className="admin-btn-action admin-btn-edit"
                                title="Edit Article"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(art.id || art._id, art.title)}
                                className="admin-btn-action admin-btn-delete"
                                title="Delete Article"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOLADES & AWARDS MANAGER */}
          {activeTab === 'accolades' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Accolades & Milestones</h1>
                  <p className="admin-section-desc">
                    Manage presidential honors, state recognition, awards, and historical milestones.
                  </p>
                </div>
                <button onClick={openNewAccoladeModal} className="admin-btn admin-btn-primary">
                  🏆 Add New Accolade
                </button>
              </div>

              {/* Featured Accolade Spotlight */}
              {accolades.featured && (
                <div className="admin-spotlight-card">
                  <div className="admin-spotlight-badge">★ CURRENT FEATURED PINNACLE AWARD</div>
                  <div className="admin-spotlight-content">
                    {accolades.featured.imageUrl && (
                      <img
                        src={accolades.featured.imageUrl}
                        alt=""
                        className="admin-spotlight-img"
                      />
                    )}
                    <div className="admin-spotlight-details">
                      <h3>
                        {accolades.featured.year} — {accolades.featured.title}
                      </h3>
                      <p><strong>Presented by:</strong> {accolades.featured.presentedBy || accolades.featured.presenter}</p>
                      <p>{accolades.featured.shortDesc}</p>
                      <div className="admin-btn-group" style={{ marginTop: '10px' }}>
                        <button
                          onClick={() => openEditAccoladeModal(accolades.featured)}
                          className="admin-btn admin-btn-secondary"
                        >
                          ✏️ Edit Featured Accolade
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Accolades Timeline List */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Img</th>
                      <th>Year</th>
                      <th>Title & Summary</th>
                      <th>Presented By / Presenter</th>
                      <th>Badge</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accolades.timeline.map((acc) => (
                      <tr key={acc.id}>
                        <td>
                          {acc.imageUrl ? (
                            <img src={acc.imageUrl} alt="" className="admin-table-thumb" />
                          ) : (
                            <div className="admin-table-thumb-placeholder">🏆</div>
                          )}
                        </td>
                        <td><strong>{acc.year}</strong></td>
                        <td>
                          <strong className="admin-item-title">{acc.title}</strong>
                          <p className="admin-item-snippet">{acc.shortDesc}</p>
                        </td>
                        <td>{acc.presentedBy || acc.presenter || '—'}</td>
                        <td>{acc.badge ? <span className="admin-tag">{acc.badge}</span> : '—'}</td>
                        <td>
                          <div className="admin-btn-group">
                            <button
                              onClick={() => openEditAccoladeModal(acc)}
                              className="admin-btn-action admin-btn-edit"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAccolade(acc.id, acc.title)}
                              className="admin-btn-action admin-btn-delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CERTIFICATES & MEDIA GALLERY */}
          {activeTab === 'certificates' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Certificates & Media Gallery</h1>
                  <p className="admin-section-desc">
                    Manage official 80G, 12A, Societies Registration certificates and photo gallery records.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCertificateForm({ title: '', caption: '', year: '', imageUrl: '', order: certificates.length + 1 })
                    setShowCertModal(true)
                  }}
                  className="admin-btn admin-btn-primary"
                >
                  📜 Upload Certificate / Image
                </button>
              </div>

              <div className="admin-media-grid">
                {certificates.map((cert) => (
                  <div key={cert._id || cert.id} className="admin-media-card">
                    <div className="admin-media-thumb-wrap">
                      <img src={cert.imageUrl} alt={cert.title} className="admin-media-img" />
                    </div>
                    <div className="admin-media-info">
                      <h4 className="admin-media-title">{cert.title}</h4>
                      {cert.year && <span className="admin-tag">{cert.year}</span>}
                      {cert.caption && <p className="admin-media-caption">{cert.caption}</p>}
                    </div>
                    <div className="admin-media-actions">
                      <button
                        onClick={() => handleDeleteCert(cert._id || cert.id, cert.title)}
                        className="admin-btn-action admin-btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EVENTS PHOTO GALLERY */}
          {activeTab === 'events' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Events Photo Gallery</h1>
                  <p className="admin-section-desc">
                    Upload event images. Only uploaded images will be displayed on the public Events page.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEventForm({ title: '', caption: '', imageUrl: '', order: eventImages.length + 1 })
                    setShowEventModal(true)
                  }}
                  className="admin-btn admin-btn-primary"
                >
                  📷 Upload Event Image
                </button>
              </div>

              {eventImages.length === 0 ? (
                <div className="admin-empty-state">
                  <p>No event images added yet. Click "Upload Event Image" to add photos for the Events page.</p>
                </div>
              ) : (
                <div className="admin-media-grid">
                  {eventImages.map((img) => {
                    const imgUrl = img.imageUrl || img.url || img.image || img.src
                    return (
                      <div key={img._id || img.id} className="admin-media-card">
                        <div className="admin-media-thumb-wrap">
                          <img src={imgUrl} alt={img.title || 'Event'} className="admin-media-img" />
                        </div>
                        <div className="admin-media-info">
                          <h4 className="admin-media-title">{img.title || 'Event Photo'}</h4>
                          {img.caption && <p className="admin-media-caption">{img.caption}</p>}
                        </div>
                        <div className="admin-media-actions">
                          <button
                            onClick={() => handleDeleteEventImage(img._id || img.id, img.title)}
                            className="admin-btn-action admin-btn-delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FAQS MANAGER */}
          {activeTab === 'faqs' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Frequently Asked Questions (FAQ)</h1>
                  <p className="admin-section-desc">
                    Add, revise, or reorder public FAQ items for visitors, donors, and families.
                  </p>
                </div>
                <button onClick={openNewFaqModal} className="admin-btn admin-btn-primary">
                  ❓ Add New FAQ
                </button>
              </div>

              <div className="admin-faq-list">
                {faqs.map((faq, index) => (
                  <div key={faq._id || index} className="admin-faq-item">
                    <div className="admin-faq-header">
                      <h3>
                        <span className="admin-faq-number">Q{index + 1}.</span> {faq.question}
                      </h3>
                      <div className="admin-btn-group">
                        <button
                          onClick={() => openEditFaqModal(faq)}
                          className="admin-btn-action admin-btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq._id)}
                          className="admin-btn-action admin-btn-delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="admin-faq-body">
                      <p>{faq.answer}</p>
                      {faq.category && <span className="admin-tag">{faq.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: INQUIRIES & MESSAGES INBOX */}
          {activeTab === 'inquiries' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Messages & Contact Inquiries</h1>
                  <p className="admin-section-desc">
                    Submissions from the Contact, Volunteer, and Donation inquiry forms.
                  </p>
                </div>
                <button onClick={loadInitialData} className="admin-btn admin-btn-secondary">
                  🔄 Refresh Inbox
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="admin-empty-state">
                  <span className="admin-empty-icon">📬</span>
                  <h3>No Inquiries Yet</h3>
                  <p>Messages submitted through the website contact forms will appear here.</p>
                </div>
              ) : (
                <div className="admin-inquiries-list">
                  {inquiries.map((inq) => (
                    <div
                      key={inq._id}
                      className={`admin-inquiry-card ${inq.status === 'read' ? 'is-read' : 'is-unread'}`}
                    >
                      <div className="admin-inquiry-top">
                        <div className="admin-inquiry-sender">
                          <strong>{inq.name}</strong>
                          <span className="admin-inquiry-meta">
                            ✉️ <a href={`mailto:${inq.email}`}>{inq.email}</a>
                            {inq.phone && ` · 📞 ${inq.phone}`}
                          </span>
                        </div>
                        <div className="admin-inquiry-time">
                          <span className="admin-tag">{inq.type || 'General'}</span>
                          <span className="admin-date-text">
                            {new Date(inq.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="admin-inquiry-message">
                        <p>{inq.message}</p>
                      </div>

                      <div className="admin-inquiry-footer">
                        <button
                          onClick={() => handleToggleInquiryStatus(inq._id, inq.status)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          {inq.status === 'read' ? 'Mark as Unread' : '✓ Mark as Read'}
                        </button>
                        <a
                          href={`mailto:${inq.email}?subject=Re: Swayamkrushi NGO Inquiry`}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                        >
                          Reply by Email ↗
                        </a>
                        <button
                          onClick={() => handleDeleteInquiry(inq._id)}
                          className="admin-btn-action admin-btn-delete"
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: WEBSITE CMS & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="admin-tab-content">
              <div className="admin-content-header">
                <div>
                  <h1 className="admin-section-title">Website CMS & Global Settings</h1>
                  <p className="admin-section-desc">
                    Update phone numbers, contact email, physical address, founder quotes, and bank donation details.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="admin-settings-form">
                <div className="admin-form-section">
                  <h2 className="admin-subsection-title">1. Organization & Contact Info</h2>
                  <div className="admin-grid-2">
                    <div className="admin-form-group">
                      <label>Organization Name</label>
                      <input
                        type="text"
                        value={settings.orgName || ''}
                        onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Primary Email (used for SMTP & contact)</label>
                      <input
                        type="email"
                        value={settings.email || ''}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="admin-input"
                        placeholder="swayamkrushimk@gmail.com"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Primary Phone Number</label>
                      <input
                        type="text"
                        value={settings.phone1 || ''}
                        onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                        className="admin-input"
                        placeholder="+91 9100106454"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Secondary Phone Number</label>
                      <input
                        type="text"
                        value={settings.phone2 || ''}
                        onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                        className="admin-input"
                        placeholder="+91 9963766729"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Physical Address</label>
                    <textarea
                      rows={2}
                      value={settings.address || ''}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="admin-textarea"
                      placeholder="Survey No.687, 688, Jawaharnagar Village..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Legal Registration Subtitle</label>
                    <input
                      type="text"
                      value={settings.regNo || ''}
                      onChange={(e) => setSettings({ ...settings, regNo: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-form-section">
                  <h2 className="admin-subsection-title">2. Taglines & Founder Quotes</h2>
                  <div className="admin-form-group">
                    <label>Website Header Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline || ''}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Founder Quotation</label>
                    <textarea
                      rows={3}
                      value={settings.founderQuote || ''}
                      onChange={(e) => setSettings({ ...settings, founderQuote: e.target.value })}
                      className="admin-textarea"
                    />
                  </div>
                </div>

                <div className="admin-form-section">
                  <h2 className="admin-subsection-title">3. Bank Donation & Financial Info</h2>
                  <div className="admin-grid-2">
                    <div className="admin-form-group">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        value={settings.bankName || ''}
                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        value={settings.accountNumber || ''}
                        onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        value={settings.ifscCode || ''}
                        onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>UPI ID</label>
                      <input
                        type="text"
                        value={settings.upiId || ''}
                        onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn admin-btn-primary admin-btn-lg">
                    💾 Save CMS Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ─── MODAL: ARTICLE CREATE / EDIT ────────────────────────────────── */}
      {showArticleModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-lg">
            <div className="admin-modal-header">
              <h2>{editingArticle ? 'Edit Article' : 'Publish New Article'}</h2>
              <button onClick={() => setShowArticleModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Article Title *</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g., A Day in the Life at Swayamkrushi"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Excerpt / Short Summary *</label>
                  <span style={{ fontSize: '12px', color: '#6e1e38', background: '#fbf4f6', border: '1px solid #f2d2dc', padding: '2px 9px', borderRadius: '12px', fontWeight: 600 }}>
                    {(articleForm.excerpt || '').length} characters &bull; {(articleForm.excerpt?.trim() ? articleForm.excerpt.trim().split(/\s+/).filter(Boolean).length : 0)} words added
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Enter your summary or lead excerpt text for frontpage & sidebar cards..."
                  className="admin-textarea"
                  style={{ minHeight: '95px', resize: 'vertical', lineHeight: '1.5', fontSize: '13.5px' }}
                />
                <div style={{ marginTop: '6px', padding: '8px 12px', background: '#fdfbfa', border: '1px dashed #d5c8be', borderRadius: '4px', fontSize: '12px', color: '#554b43' }}>
                  <span style={{ fontWeight: 700, color: '#6e1e38', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                    Live Card Teaser:
                  </span>{' '}
                  {articleForm.excerpt?.trim() ? (
                    <span>
                      "{articleForm.excerpt.trim()}{articleForm.excerpt.trim().endsWith('...') || articleForm.excerpt.trim().endsWith('…') ? '' : '...'}"
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      Type your excerpt above to see live preview with trailing ...
                    </span>
                  )}
                </div>
              </div>

              <div className="admin-grid-3">
                <div className="admin-form-group">
                  <label>Section Placement</label>
                  <select
                    value={articleForm.section}
                    onChange={(e) => setArticleForm({ ...articleForm, section: e.target.value })}
                    className="admin-select"
                  >
                    <option value="main">Main / Center Column</option>
                    <option value="left">Left Column (The Compass)</option>
                    <option value="right">Right Column (The Chronicle)</option>
                    <option value="feature">Featured Highlight</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    placeholder="e.g. Stories & Milestones"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label>Attribution / Byline</label>
                  <input
                    type="text"
                    value={articleForm.attribution}
                    onChange={(e) => setArticleForm({ ...articleForm, attribution: e.target.value })}
                    placeholder="Swayamkrushi Archives"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div className="admin-form-group">
                <label>Article Image (Cloudinary Direct Upload or URL)</label>
                <div className="admin-image-picker-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setArticleForm, 'imageUrl')}
                    className="admin-file-input"
                    disabled={uploadingImage}
                  />
                  <span className="admin-or-divider">OR</span>
                  <input
                    type="text"
                    placeholder="Paste image URL (e.g. https://res.cloudinary.com/...)"
                    value={articleForm.imageUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                    className="admin-input"
                  />
                </div>
                {uploadingImage && <p className="admin-uploading-text">Uploading to Cloudinary...</p>}
                {articleForm.imageUrl && (
                  <div className="admin-img-preview-box">
                    <img src={articleForm.imageUrl} alt="Preview" className="admin-preview-img" />
                    <button
                      type="button"
                      onClick={() => {
                        const imgToDelete = articleForm.imageUrl
                        setArticleForm({ ...articleForm, imageUrl: '' })
                        if (imgToDelete && imgToDelete.includes('cloudinary.com')) {
                          deleteMediaFromCloudinary(imgToDelete).catch((err) =>
                            console.error('Failed to delete hero image from Cloudinary:', err)
                          )
                        }
                      }}
                      className="admin-btn-remove-img"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Cover Photo Caption */}
              <div className="admin-form-group">
                <label style={{ fontWeight: 600, color: '#3d342f' }}>Cover / Hero Photo Caption</label>
                <input
                  type="text"
                  placeholder="Caption for cover / hero photo..."
                  value={articleForm.imageAlt || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, imageAlt: e.target.value })}
                  className="admin-input"
                />
                <span style={{ fontSize: '11px', color: '#776e65', marginTop: '4px', display: 'block' }}>
                  This caption is displayed directly beneath the cover photo on cards and in the article header.
                </span>
              </div>

              {/* 🎬 VIDEO SPOTLIGHT & PLACEMENT */}
              <div className="admin-form-group" style={{ background: '#f8f5f8', border: '1px solid #e2d2dc', borderRadius: '8px', padding: '16px', marginTop: '6px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#4a1525' }}>
                      🎬 Video Spotlight & Placement
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#665058' }}>
                      Add or edit video for this article. Choose size (Small or Big) and placement (Top Hero, Left, Right, or Center).
                    </p>
                  </div>
                  {articleForm.videoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const vidUrl = articleForm.videoUrl
                        const posterUrl = articleForm.videoThumbnailUrl || articleForm.videoPosterUrl
                        setArticleForm({ ...articleForm, videoUrl: '', videoThumbnailUrl: '', videoPosterUrl: '' })
                        if (vidUrl && vidUrl.includes('cloudinary.com')) {
                          deleteMediaFromCloudinary(vidUrl, 'video').catch((err) =>
                            console.error('Failed to delete video from Cloudinary:', err)
                          )
                        }
                        if (posterUrl && posterUrl.includes('cloudinary.com')) {
                          deleteMediaFromCloudinary(posterUrl, 'image').catch((err) =>
                            console.error('Failed to delete video poster from Cloudinary:', err)
                          )
                        }
                      }}
                      style={{ background: '#f0e4e9', border: '1px solid #d2b4c0', color: '#6e1e38', fontSize: '11px', fontWeight: 600, padding: '4px 9px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ✕ Remove Video
                    </button>
                  )}
                </div>

                <div className="admin-grid-2" style={{ marginTop: '10px' }}>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '12px' }}>Video URL (Cloudinary mp4 or Web link)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://res.cloudinary.com/.../video.mp4"
                      value={articleForm.videoUrl || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, videoUrl: e.target.value })}
                      className="admin-input"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '12px' }}>Video Thumbnail / Poster Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://res.cloudinary.com/.../poster.jpg"
                      value={articleForm.videoThumbnailUrl || articleForm.videoPosterUrl || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, videoThumbnailUrl: e.target.value, videoPosterUrl: e.target.value })}
                      className="admin-input"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                </div>

                {articleForm.videoUrl && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '12px', background: '#fff', padding: '12px 14px', borderRadius: '6px', border: '1px solid #ebd9c8' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a3f35', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                        Video Size:
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setArticleForm({ ...articleForm, videoSize: 'small' })}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: articleForm.videoSize === 'small' ? '1.5px solid #6e1e38' : '1px solid #cbbaa8',
                            background: articleForm.videoSize === 'small' ? '#6e1e38' : '#ffffff',
                            color: articleForm.videoSize === 'small' ? '#ffffff' : '#333333',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          ◻ Small (Compact)
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleForm({ ...articleForm, videoSize: 'big' })}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: (articleForm.videoSize || 'big') === 'big' ? '1.5px solid #6e1e38' : '1px solid #cbbaa8',
                            background: (articleForm.videoSize || 'big') === 'big' ? '#6e1e38' : '#ffffff',
                            color: (articleForm.videoSize || 'big') === 'big' ? '#ffffff' : '#333333',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          ◼ Big (Full Width)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a3f35', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                        Video Placement:
                      </label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                          { key: 'top', label: '⬆ Top' },
                          { key: 'left', label: '⬅ Left' },
                          { key: 'right', label: '➡ Right' },
                          { key: 'center', label: '⬌ Center' }
                        ].map((pos) => (
                          <button
                            key={pos.key}
                            type="button"
                            onClick={() => setArticleForm({ ...articleForm, videoPlacement: pos.key })}
                            style={{
                              flex: 1,
                              padding: '5px 6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              border: (articleForm.videoPlacement || 'top') === pos.key ? '1.5px solid #6e1e38' : '1px solid #cbbaa8',
                              background: (articleForm.videoPlacement || 'top') === pos.key ? '#6e1e38' : '#ffffff',
                              color: (articleForm.videoPlacement || 'top') === pos.key ? '#ffffff' : '#333333',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 🖼️ STORY PHOTOS & INDIVIDUAL IMAGE CAPTIONS */}
              <div className="admin-form-group" style={{ background: '#fdfbf7', border: '1px solid #ebd9c8', borderRadius: '8px', padding: '16px', marginTop: '6px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#3d342f' }}>
                      🖼️ Story Photos & Placement / Sizing Controls
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#776e65' }}>
                      Position photos anywhere in the article (Left, Right, Center) and set size to <strong>Small</strong> or <strong>Big</strong>. Removing a photo completely deletes it and its caption.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                      + Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleUploadStoryImage}
                        disabled={uploadingStoryImage}
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={handleAddStoryImageUrl}
                    >
                      + Add Image URL
                    </button>
                  </div>
                </div>

                {uploadingStoryImage && (
                  <p style={{ fontSize: '12px', color: '#6e1e38', fontWeight: 600, margin: '8px 0' }}>
                    Uploading story photo to Cloudinary CDN...
                  </p>
                )}

                {(!articleForm.images || articleForm.images.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '20px 12px', background: '#fff', border: '1px dashed #d7ccc8', borderRadius: '6px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#776e65' }}>No story photos added yet.</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9e9087' }}>Click <strong>+ Upload Photo</strong> or <strong>+ Add Image URL</strong> above to add photos with individual sizing and captions.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {articleForm.images.map((imgItem, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e0d7ce',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                      >
                        {/* Photo Thumbnail & Control Bar */}
                        <div style={{ position: 'relative', height: '160px', background: '#f5f0eb' }}>
                          <img
                            src={imgItem.url}
                            alt={imgItem.caption || `Story photo ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <div style={{ position: 'absolute', top: '6px', left: '6px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                              Photo #{idx + 1}
                            </span>
                            <span style={{ background: (imgItem.size === 'big' ? '#6e1e38' : '#2d6a4f'), color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {imgItem.size === 'big' ? 'BIG' : 'SMALL'}
                            </span>
                          </div>
                          <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveStoryImage(idx, 'up')}
                              disabled={idx === 0}
                              style={{
                                background: idx === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 7px',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: idx === 0 ? '#aaa' : '#1b1418'
                              }}
                              title="Move this image UP in article order"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStoryImage(idx, 'down')}
                              disabled={idx === articleForm.images.length - 1}
                              style={{
                                background: idx === articleForm.images.length - 1 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 7px',
                                cursor: idx === articleForm.images.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: idx === articleForm.images.length - 1 ? '#aaa' : '#1b1418'
                              }}
                              title="Move this image DOWN in article order"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditStoryImageUrl(idx)}
                              style={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', fontSize: '11px' }}
                              title="Edit Image URL"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStoryImage(idx)}
                              style={{ background: 'rgba(180, 20, 40, 0.95)', border: 'none', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                              title="Delete this photo and its caption from article"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Controls & Dedicated Caption Input */}
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, background: '#faf8f5', borderTop: '1px solid #ebd9c8' }}>
                          {/* Sizing Toggle: Small vs Big */}
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a3f35', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                              Photo Size:
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateStoryImageProperty(idx, 'size', 'small')}
                                style={{
                                  flex: 1,
                                  padding: '5px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  border: (imgItem.size || 'small') === 'small' ? '1.5px solid #6e1e38' : '1px solid #cbbaa8',
                                  background: (imgItem.size || 'small') === 'small' ? '#6e1e38' : '#ffffff',
                                  color: (imgItem.size || 'small') === 'small' ? '#ffffff' : '#333333',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                ◻ Small (Side)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStoryImageProperty(idx, 'size', 'big')}
                                style={{
                                  flex: 1,
                                  padding: '5px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  border: imgItem.size === 'big' ? '1.5px solid #6e1e38' : '1px solid #cbbaa8',
                                  background: imgItem.size === 'big' ? '#6e1e38' : '#ffffff',
                                  color: imgItem.size === 'big' ? '#ffffff' : '#333333',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                ◼ Big (Full Width)
                              </button>
                            </div>
                          </div>

                          {/* Placement Toggle: Left / Right / Center */}
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a3f35', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                              Placement:
                            </label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {[
                                { key: 'left', label: '⬅ Left' },
                                { key: 'right', label: '➡ Right' },
                                { key: 'center', label: '⬌ Center' }
                              ].map((pos) => (
                                <button
                                  key={pos.key}
                                  type="button"
                                  onClick={() => handleUpdateStoryImageProperty(idx, 'placement', pos.key)}
                                  style={{
                                    flex: 1,
                                    padding: '4px 6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    border: (imgItem.placement || 'left') === pos.key ? '1.5px solid #6e1e38' : '1px solid #cbbaa8',
                                    background: (imgItem.placement || 'left') === pos.key ? '#6e1e38' : '#ffffff',
                                    color: (imgItem.placement || 'left') === pos.key ? '#ffffff' : '#333333',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {pos.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Dedicated Caption Input Box */}
                          <div style={{ marginTop: '2px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a3f35', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, display: 'block', marginBottom: '3px' }}>
                              Caption for Photo #{idx + 1}:
                            </label>
                            <textarea
                              rows={2}
                              value={imgItem.caption || ''}
                              onChange={(e) => handleUpdateStoryImageCaption(idx, e.target.value)}
                              placeholder={`Enter caption describing photo #${idx + 1}...`}
                              className="admin-textarea"
                              style={{
                                fontSize: '12px',
                                padding: '7px 9px',
                                minHeight: '52px',
                                resize: 'vertical',
                                background: '#ffffff',
                                border: '1px solid #cbbaa8',
                                borderRadius: '4px',
                                lineHeight: 1.35
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#887b70', marginTop: '2px' }}>
                            <span title={imgItem.url} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                              {imgItem.url ? imgItem.url.split('/').pop() : 'No URL'}
                            </span>
                            <a href={imgItem.url} target="_blank" rel="noreferrer" style={{ color: '#6e1e38', textDecoration: 'underline', fontWeight: 600 }}>
                              View full ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paragraphs Editor */}
              <div className="admin-form-group">
                <div className="admin-subhead-row">
                  <label>Article Body Paragraphs ({articleForm.paragraphs.length})</label>
                  <button
                    type="button"
                    onClick={addArticleParagraph}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    + Add Paragraph
                  </button>
                </div>
                {articleForm.paragraphs.map((p, idx) => (
                  <div key={idx} className="admin-para-row">
                    <span className="admin-para-idx">#{idx + 1}</span>
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => handleArticleParagraphChange(idx, e.target.value)}
                      placeholder={`Paragraph ${idx + 1}...`}
                      className="admin-textarea"
                    />
                    {articleForm.paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArticleParagraph(idx)}
                        className="admin-btn-action admin-btn-delete"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Display Order (Priority)</label>
                  <input
                    type="number"
                    value={articleForm.order}
                    onChange={(e) => setArticleForm({ ...articleForm, order: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group admin-checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={articleForm.featured}
                      onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                    />
                    Mark as Spotlight / Featured Article
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingArticle ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ACCOLADE CREATE / EDIT ──────────────────────────────── */}
      {showAccoladeModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingAccolade ? 'Edit Accolade' : 'Add New Accolade'}</h2>
              <button onClick={() => setShowAccoladeModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccolade} className="admin-modal-form">
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Year *</label>
                  <input
                    type="text"
                    required
                    value={accoladeForm.year}
                    onChange={(e) => setAccoladeForm({ ...accoladeForm, year: e.target.value })}
                    placeholder="e.g. 2004 or 1999"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Badge / Category</label>
                  <input
                    type="text"
                    value={accoladeForm.badge}
                    onChange={(e) => setAccoladeForm({ ...accoladeForm, badge: e.target.value })}
                    placeholder="e.g. National Honor"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Accolade Title *</label>
                <input
                  type="text"
                  required
                  value={accoladeForm.title}
                  onChange={(e) => setAccoladeForm({ ...accoladeForm, title: e.target.value })}
                  placeholder="e.g. National Award from President Dr. A.P.J. Abdul Kalam"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Presented By / Presenter</label>
                <input
                  type="text"
                  value={accoladeForm.presentedBy}
                  onChange={(e) => setAccoladeForm({ ...accoladeForm, presentedBy: e.target.value })}
                  placeholder="e.g. Ministry of Social Justice & Empowerment"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={accoladeForm.shortDesc}
                  onChange={(e) => setAccoladeForm({ ...accoladeForm, shortDesc: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div className="admin-form-group">
                <label>Full Story / Description</label>
                <textarea
                  rows={3}
                  value={accoladeForm.fullDesc}
                  onChange={(e) => setAccoladeForm({ ...accoladeForm, fullDesc: e.target.value })}
                  className="admin-textarea"
                />
              </div>

              <div className="admin-form-group">
                <label>Photo / Award Image (Upload to Cloudinary)</label>
                <div className="admin-image-picker-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setAccoladeForm, 'imageUrl')}
                    className="admin-file-input"
                    disabled={uploadingImage}
                  />
                  <span className="admin-or-divider">OR</span>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={accoladeForm.imageUrl}
                    onChange={(e) => setAccoladeForm({ ...accoladeForm, imageUrl: e.target.value })}
                    className="admin-input"
                  />
                </div>
                {accoladeForm.imageUrl && (
                  <div className="admin-img-preview-box">
                    <img src={accoladeForm.imageUrl} alt="Preview" className="admin-preview-img" />
                  </div>
                )}
              </div>

              <div className="admin-form-group admin-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={accoladeForm.isFeatured}
                    onChange={(e) => setAccoladeForm({ ...accoladeForm, isFeatured: e.target.checked })}
                  />
                  Set as Highlighted Pinnacle Award (Main Spotlight)
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAccoladeModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingAccolade ? 'Save Changes' : 'Add Accolade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CERTIFICATE UPLOAD ──────────────────────────────────── */}
      {showCertModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Upload Certificate or Media Document</h2>
              <button onClick={() => setShowCertModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Certificate Title *</label>
                <input
                  type="text"
                  required
                  value={certificateForm.title}
                  onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                  placeholder="e.g. 80G Tax Exemption Certificate"
                  className="admin-input"
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Year / Validity</label>
                  <input
                    type="text"
                    value={certificateForm.year}
                    onChange={(e) => setCertificateForm({ ...certificateForm, year: e.target.value })}
                    placeholder="e.g. 2024-2029"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    value={certificateForm.order}
                    onChange={(e) => setCertificateForm({ ...certificateForm, order: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Caption / Notes</label>
                <input
                  type="text"
                  value={certificateForm.caption}
                  onChange={(e) => setCertificateForm({ ...certificateForm, caption: e.target.value })}
                  placeholder="e.g. Issued by Director of Income Tax"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Certificate Image / Document *</label>
                <div className="admin-image-picker-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setCertificateForm, 'imageUrl')}
                    className="admin-file-input"
                    disabled={uploadingImage}
                  />
                  <span className="admin-or-divider">OR</span>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={certificateForm.imageUrl}
                    onChange={(e) => setCertificateForm({ ...certificateForm, imageUrl: e.target.value })}
                    className="admin-input"
                    required
                  />
                </div>
                {certificateForm.imageUrl && (
                  <div className="admin-img-preview-box">
                    <img src={certificateForm.imageUrl} alt="Preview" className="admin-preview-img" />
                  </div>
                )}
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EVENT IMAGE UPLOAD ─────────────────────────────────── */}
      {showEventModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Upload Event Image</h2>
              <button onClick={() => setShowEventModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEventImage} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Event Image *</label>
                <div className="admin-image-picker-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setEventForm, 'imageUrl')}
                    className="admin-file-input"
                    disabled={uploadingImage}
                  />
                  <span className="admin-or-divider">OR</span>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={eventForm.imageUrl}
                    onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                    className="admin-input"
                  />
                </div>
                {uploadingImage && <p className="admin-uploading-text">Uploading image...</p>}
                {eventForm.imageUrl && (
                  <div className="admin-img-preview-box">
                    <img src={eventForm.imageUrl} alt="Preview" className="admin-preview-img" />
                  </div>
                )}
              </div>

              <div className="admin-form-group">
                <label>Title / Caption (Optional)</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Annual Day 2026 Celebration"
                  className="admin-input"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || !eventForm.imageUrl}
                  className="admin-btn admin-btn-primary"
                >
                  Save & Publish to Events
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: FAQ CREATE / EDIT ────────────────────────────────────── */}
      {showFaqModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}</h2>
              <button onClick={() => setShowFaqModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Question *</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. How can I sponsor a resident?"
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Detailed answer for visitors..."
                  className="admin-textarea"
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    placeholder="General / Admissions / Donations"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    value={faqForm.order}
                    onChange={(e) => setFaqForm({ ...faqForm, order: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingFaq ? 'Save Changes' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: COMMITTEE MEMBER CREATE / EDIT ───────────────────────── */}
      {showCommitteeModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-wide">
            <div className="admin-modal-header">
              <h2>{editingCommitteeMember ? 'Edit Committee Member' : 'Add New Committee Member'}</h2>
              <button onClick={() => setShowCommitteeModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCommittee} className="admin-modal-form">
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={committeeForm.name}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, name: e.target.value })}
                    placeholder="e.g. Dr. Manjulaa Kalyaan"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Role / Job Title *</label>
                  <input
                    type="text"
                    required
                    value={committeeForm.role}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, role: e.target.value })}
                    placeholder="e.g. Founder & Director / Patron / President / Secretary"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-grid-3">
                <div className="admin-form-group">
                  <label>Governance Category</label>
                  <select
                    value={committeeForm.roleCategory}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, roleCategory: e.target.value })}
                    className="admin-select"
                  >
                    <option value="Founder">Founder</option>
                    <option value="Patron">Patron</option>
                    <option value="Presidency">Presidency</option>
                    <option value="Secretariat">Secretariat</option>
                    <option value="Executive">Executive Committee</option>
                    <option value="General">General Member</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Badge Text</label>
                  <input
                    type="text"
                    value={committeeForm.badge}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, badge: e.target.value })}
                    placeholder="e.g. FOUNDER DIRECTOR"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Color Theme</label>
                  <select
                    value={committeeForm.colorTheme}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, colorTheme: e.target.value })}
                    className="admin-select"
                  >
                    <option value="burgundy">Burgundy (Primary / Founder)</option>
                    <option value="gold">Gold (Patron)</option>
                    <option value="indigo">Indigo (Presidency / Secretariat)</option>
                    <option value="slate">Slate (Executive Board)</option>
                  </select>
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Designation / Affiliation</label>
                  <input
                    type="text"
                    value={committeeForm.designation}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, designation: e.target.value })}
                    placeholder="e.g. Advocate Supreme Court BAR / Master Mariner"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Credentials / Sub-header</label>
                  <input
                    type="text"
                    value={committeeForm.credentials}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, credentials: e.target.value })}
                    placeholder="e.g. Four-time National Award Winner · RCI Nominated Expert"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Biography & Contribution</label>
                <textarea
                  rows={4}
                  value={committeeForm.bio}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, bio: e.target.value })}
                  placeholder="Detailed background, accomplishments, and leadership at Swayamkrushi..."
                  className="admin-textarea"
                />
              </div>

              <div className="admin-form-group">
                <label>Member Portrait Image (Upload File or URL)</label>
                <div className="admin-upload-controls">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setCommitteeForm, 'image')}
                    className="admin-file-input"
                    disabled={uploadingImage}
                  />
                  <span className="admin-or-divider">OR</span>
                  <input
                    type="text"
                    placeholder="https://... or Leave blank for initials monogram"
                    value={committeeForm.image}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, image: e.target.value })}
                    className="admin-input"
                  />
                </div>
                {committeeForm.image && (
                  <div className="admin-img-preview-box" style={{ marginTop: 10 }}>
                    <img src={committeeForm.image} alt="Preview" className="admin-preview-img" style={{ maxHeight: 120, objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <div className="admin-grid-3">
                <div className="admin-form-group">
                  <label>Monogram Initials</label>
                  <input
                    type="text"
                    value={committeeForm.initials}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, initials: e.target.value.toUpperCase() })}
                    placeholder="e.g. MK"
                    maxLength={3}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={committeeForm.tags}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, tags: e.target.value })}
                    placeholder="Founded 1991, 4x Awardee, Legal Patron"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={committeeForm.order}
                    onChange={(e) => setCommitteeForm({ ...committeeForm, order: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCommitteeModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingCommitteeMember ? 'Save Committee Member' : 'Add Committee Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: MEDIA BUZZ ARTICLE CREATE / EDIT ─────────────────────── */}
      {showMediaBuzzModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-wide">
            <div className="admin-modal-header">
              <h2>{editingMediaBuzz ? 'Edit Media Buzz Article' : 'Publish Media Buzz Story'}</h2>
              <button onClick={() => setShowMediaBuzzModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMediaBuzz} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Article Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={mediaBuzzForm.title}
                  onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, title: e.target.value })}
                  placeholder="e.g. From classrooms to careers, Hyderabad’s Swayamkrushi..."
                  className="admin-input"
                />
              </div>

              <div className="admin-grid-3">
                <div className="admin-form-group">
                  <label>Outlet / Publication *</label>
                  <input
                    type="text"
                    required
                    value={mediaBuzzForm.outlet}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, outlet: e.target.value })}
                    placeholder="e.g. The Hindu / NewsMeter / Sakshi / Telangana Today"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Outlet Type</label>
                  <select
                    value={mediaBuzzForm.outletType}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, outletType: e.target.value })}
                    className="admin-select"
                  >
                    <option value="Print & Newspapers">Print & Newspapers</option>
                    <option value="Digital & Magazines">Digital & Magazines</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Date Published</label>
                  <input
                    type="text"
                    value={mediaBuzzForm.date}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, date: e.target.value })}
                    placeholder="e.g. August 2026 / 09/08/2026"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Category / Badge</label>
                  <input
                    type="text"
                    value={mediaBuzzForm.badge}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, badge: e.target.value })}
                    placeholder="e.g. THE HINDU SPOTLIGHT / FEATURE STORY / SAKSHI E-PAPER"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Read Time / Format Tag</label>
                  <input
                    type="text"
                    value={mediaBuzzForm.readTime}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, readTime: e.target.value })}
                    placeholder="e.g. Newspaper Report / 5 min read / Telugu E-Paper"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Story Excerpt / Summary</label>
                  <span style={{ fontSize: '12px', color: '#6e1e38', background: '#fbf4f6', border: '1px solid #f2d2dc', padding: '2px 9px', borderRadius: '12px', fontWeight: 600 }}>
                    {(mediaBuzzForm.excerpt || '').length} characters &bull; {(mediaBuzzForm.excerpt?.trim() ? mediaBuzzForm.excerpt.trim().split(/\s+/).filter(Boolean).length : 0)} words added
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={mediaBuzzForm.excerpt}
                  onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, excerpt: e.target.value })}
                  placeholder="Summary of the news story or newspaper feature..."
                  className="admin-textarea"
                  style={{ minHeight: '90px', resize: 'vertical', lineHeight: '1.5' }}
                />
              </div>

              <div className="admin-form-group">
                <label>Newspaper Clipping / Article Image (Optional)</label>
                <div className="admin-upload-controls">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setMediaBuzzForm, 'image')}
                    className="admin-file-input"
                    disabled={uploadingImage}
                  />
                  <span className="admin-or-divider">OR</span>
                  <input
                    type="text"
                    placeholder="Image URL (Leave empty if no authentic image exists)"
                    value={mediaBuzzForm.image || ''}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, image: e.target.value })}
                    className="admin-input"
                  />
                </div>
                {mediaBuzzForm.image && (
                  <div className="admin-img-preview-box" style={{ marginTop: 10 }}>
                    <img src={mediaBuzzForm.image} alt="Preview" className="admin-preview-img" style={{ maxHeight: 120, objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Article URL (Direct web link to read full story)</label>
                  <input
                    type="url"
                    value={mediaBuzzForm.articleUrl}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, articleUrl: e.target.value })}
                    placeholder="https://newsmeter.in/..."
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Share / E-Paper Mirror URL (Optional)</label>
                  <input
                    type="url"
                    value={mediaBuzzForm.shareUrl}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, shareUrl: e.target.value })}
                    placeholder="https://share.google/..."
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-grid-3">
                <div className="admin-form-group">
                  <label>Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={mediaBuzzForm.tags}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, tags: e.target.value })}
                    placeholder="The Hindu, 35th Anniversary, Special Education"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={mediaBuzzForm.order}
                    onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, order: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={mediaBuzzForm.isClipping}
                      onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, isClipping: e.target.checked })}
                    />
                    <span>Is Newspaper Clipping (Zoomable)</span>
                  </label>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={mediaBuzzForm.featured}
                      onChange={(e) => setMediaBuzzForm({ ...mediaBuzzForm, featured: e.target.checked })}
                    />
                    <span>Featured Headline Story</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowMediaBuzzModal(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingMediaBuzz ? 'Save Story' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
