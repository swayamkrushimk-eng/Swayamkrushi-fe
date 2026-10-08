import { useEffect } from 'react'

const DEFAULT_SEO = {
  title: 'Swayamkrushi | Empowering Persons with Intellectual Disabilities Since 1991',
  description: 'Swayamkrushi (Reg. No. 3608/1991) is a pioneering NGO in Secunderabad, Telangana providing lifelong residential care, group homes, special education, speech & physiotherapy, and recognized B.Ed Special Education.',
  keywords: 'Swayamkrushi, NGO Hyderabad, special education Secunderabad, intellectual disability residential care, group homes Telangana, vocational training special needs, Manjula Kalyan, B.Ed special education',
  canonicalUrl: 'https://swayamkrushi.org/',
  ogType: 'website',
  ogImage: 'https://swayamkrushi.org/assets/images/logo.png',
  author: 'Swayamkrushi NGO'
}

function updateMetaTag(name, content, isProperty = false) {
  if (!content) return
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let element = document.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    if (isProperty) {
      element.setAttribute('property', name)
    } else {
      element.setAttribute('name', name)
    }
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function updateCanonicalLink(url) {
  if (!url) return
  let element = document.querySelector('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', url)
}

function updateStructuredData(schemaObj) {
  const SCRIPT_ID = 'dynamic-seo-jsonld'
  let scriptElement = document.getElementById(SCRIPT_ID)
  
  if (!schemaObj) {
    if (scriptElement) scriptElement.remove()
    return
  }

  if (!scriptElement) {
    scriptElement = document.createElement('script')
    scriptElement.id = SCRIPT_ID
    scriptElement.type = 'application/ld+json'
    document.head.appendChild(scriptElement)
  }

  scriptElement.textContent = JSON.stringify(schemaObj, null, 2)
}

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType,
  ogImage,
  author,
  schema
}) {
  const currentTitle = title
    ? (title.includes('Swayamkrushi') ? title : `${title} | Swayamkrushi`)
    : DEFAULT_SEO.title

  const currentDesc = description || DEFAULT_SEO.description
  const currentKeywords = keywords || DEFAULT_SEO.keywords
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : DEFAULT_SEO.canonicalUrl)
  const currentOgType = ogType || DEFAULT_SEO.ogType
  const currentOgImage = ogImage || DEFAULT_SEO.ogImage
  const currentAuthor = author || DEFAULT_SEO.author

  useEffect(() => {
    // 1. Update Document Title
    document.title = currentTitle

    // 2. Update Standard SEO Meta Tags
    updateMetaTag('description', currentDesc)
    updateMetaTag('keywords', currentKeywords)
    updateMetaTag('author', currentAuthor)
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

    // 3. Update Open Graph Tags
    updateMetaTag('og:title', currentTitle, true)
    updateMetaTag('og:description', currentDesc, true)
    updateMetaTag('og:url', currentUrl, true)
    updateMetaTag('og:type', currentOgType, true)
    updateMetaTag('og:image', currentOgImage, true)
    updateMetaTag('og:site_name', 'Swayamkrushi', true)

    // 4. Update Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', currentTitle)
    updateMetaTag('twitter:description', currentDesc)
    updateMetaTag('twitter:image', currentOgImage)

    // 5. Update Canonical Link
    updateCanonicalLink(currentUrl)

    // 6. Update JSON-LD Structured Data Schema
    updateStructuredData(schema)

    return () => {
      // Optional cleanup on component unmount
    }
  }, [currentTitle, currentDesc, currentKeywords, currentUrl, currentOgType, currentOgImage, currentAuthor, schema])

  return null
}
