import { useEffect, useState, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articleImagesMap } from '../data/allArticles'
import { fetchArticleById, isIdDeleted } from '../services/api'
import ArticleContentRenderer from '../components/ArticleContentRenderer'
import VideoPlayer from '../components/VideoPlayer'
import { resolveArticleMedia, isSameImage, isVideoUrl } from '../utils/mediaUtils'
import SEO from '../components/SEO'
import ArticleAudioPlayer from '../components/ArticleAudioPlayer'
import manjulaaVisionaryImg from '../assets/images/manjulaa-visionary-home-of-care.png'
import './ArticlePage.css'

const HOME_OF_CARE_VISIONARY = {
  url: manjulaaVisionaryImg,
  // Caption is baked into the artwork; keep figcaption empty to avoid duplication.
  caption: '',
  alt: "VISIONARY: Swayamkrushi is a manifestation of Manjulaa Kalyaan's dream to care for and rehabilitate persons with intellectual disabilities",
  placement: 'right',
  size: 'small',
  type: 'image',
  afterHeading: 'The heart and soul of Swayamkrushi'
}

const EDITORIAL_SECTIONS = [
  {
    title: 'Building Blocks',
    articles: [
      { id: '35-glorious-years', title: '35 years of glory!' },
      { id: 'building-blocks', alias: 'blood-sweat-and-tears', title: 'Blood, Sweat and Tears' },
      { id: 'home-of-care', title: 'A Home of Care, Growth and Hope' },
      { id: 'group-homes', title: 'Group Home — A Pioneering Initiative Ahead of Time' },
      { id: 'bed-hotspot', title: 'Swayamkrushi — The B.Ed Hotspot' },
    ],
  },
  {
    title: "Manjula's Musings",
    articles: [
      { id: 'story-encounter', title: 'Chance Encounter That Changed My Life' },
      { id: 'story-group-homes-initiative', title: 'Group Homes – Pioneering initiative that catapulted Swayamkrushi into higher orbit' },
      { id: 'story-durga', title: 'Durga – My Alter Ego' },
      { id: 'story-womens-empowerment', title: 'Women’s empowerment - A byproduct of Swayamkrushi' },
    ],
  },
  {
    title: 'Activities galore',
    articles: [
      { id: 'story-fifteen-years', alias: 'story-15-years', title: '15 Years for One Word, and Then the Exhilaration!' },
      { id: 'story-art-equaliser', title: 'Art — The Great Equaliser' },
      { id: 'story-nios', title: 'NIOS — Boon for Persons with Intellectual Disabilities' },
      { id: 'story-paper-bag', title: "Paper Bag Making — It's a 'Mild' Job" },
      { id: 'story-exercise', title: 'Exercise of a Different Kind' },
      { id: 'story-therapy-body-soul-mind', title: 'Therapy for body, soul and mind' },
      { id: 'story-sowing-seeds', alias: 'story-tailoring', title: 'Sowing Seeds of Creativity' },
      { id: 'story-kitchen', title: 'Kitchen — Beehive of Activity' },
      { id: 'story-covid', title: 'The Covid Years — Opportunities to Serve' },
    ],
  },
  {
    title: 'Fun facts',
    articles: [
      { id: 'story-sai-baba', title: 'The Mysterious Appearance of Shirdi Sai Baba' },
      { id: 'story-thinking', title: 'Thinking Out of the Box!' },
      { id: 'story-visa', title: 'Visa to Go Abroad' },
      { id: 'story-kadiam', title: 'Destination Kadiam, for Plants' },
      { id: 'story-dairy', title: 'Dairy for a Purpose!' },
    ],
  },
  {
    title: 'Winning hearts',
    articles: [
      { id: 'story-hard-work', title: 'Hard Work Never Goes Unrewarded!' },
      { id: 'story-luck-hardwork', title: 'Luck, Hard Work and Guardian Angel Spell Success' },
      { id: 'story-recipe-success', title: 'Recipe for Success' },
      { id: 'story-phani', title: 'Phani — The Man for All Seasons' },
      { id: 'story-champions', title: 'Champions All the Way — Special Olympics' },
    ],
  },
]

export default function ArticlePage({ defaultId }) {
  const { id: paramId } = useParams()
  const id = paramId || defaultId || 'story-encounter'
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    if (isIdDeleted('article', id)) {
      setArticle(null)
      setLoading(false)
      return
    }
    fetchArticleById(id).then((data) => {
      // Site always mirrors admin/API — do not fall back to bundled local JSON
      if (data && data.title && !isIdDeleted('article', id) && !isIdDeleted('article', data.id)) {
        setArticle(data)
      } else {
        setArticle(null)
      }
      setLoading(false)
    }).catch(() => {
      setArticle(null)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <main className="article-page-wrap" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6f6a6c' }}>
          <p style={{ fontStyle: 'italic', fontSize: '15px' }}>Loading story...</p>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="article-page-wrap">
        <div className="article-not-found">
          <h2>Article Not Found</h2>
          <p>The story you are looking for could not be found or has been moved.</p>
          <Link to="/" className="back-home-btn">← Return to Swayamkrushi Home</Link>
        </div>
      </main>
    )
  }

  // Clean all paragraphs
  const allParagraphs = (article.paragraphs && article.paragraphs.length > 0)
    ? article.paragraphs
    : [article.excerpt || '']

  // Respect admin featured media. Only promote a body video to the hero when the
  // article is meant to be a video story (or legacy entries with no featured image).
  // Dare to Dream / Home of Care always keep their story video as the top hero.
  const articleForMedia = (() => {
    const next = { ...article }
    const isForcedTopVideo =
      next.id === 'dare-to-dream' ||
      id === 'dare-to-dream' ||
      next.id === 'home-of-care' ||
      id === 'home-of-care'
    const featuredType = String(next.featuredMediaType || next.mediaType || '').toLowerCase()
    const adminSaysImage =
      !isForcedTopVideo &&
      (featuredType === 'image' || (!!next.imageUrl && featuredType !== 'video' && featuredType !== 'text'))
    const adminSaysVideo = featuredType === 'video' || isForcedTopVideo
    const adminSaysText =
      !isForcedTopVideo && (featuredType === 'text' || next.hasThumbnail === false)

    const findVideoInImages = () => {
      if (!Array.isArray(next.images)) return null
      for (const img of next.images) {
        const url = typeof img === 'string' ? img : img?.url
        if (!url) continue
        const type = typeof img === 'object' ? img.type : ''
        if (type === 'video' || isVideoUrl(url)) {
          return {
            url,
            caption: typeof img === 'object' ? (img.caption || img.alt || '') : ''
          }
        }
      }
      return null
    }
    const findVideoInHtml = () => {
      const html = next.contentHtml || ''
      const match = html.match(/<video[^>]+src=["']([^"']+)["']/i) || html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|webm|mov|m4v)[^"']*)["']/i)
      return match?.[1] ? { url: match[1], caption: '' } : null
    }

    const missingHeroVideo = !next.videoUrl || String(next.videoUrl).trim().length < 5
    // Do not steal story clips into the hero when admin set featured media to Image
    // (except Dare to Dream / Home of Care, which always use the top video hero).
    const mayPromoteVideo =
      missingHeroVideo &&
      (isForcedTopVideo ||
        (!adminSaysImage && !adminSaysText && (adminSaysVideo || !next.imageUrl)))

    const promoted = mayPromoteVideo ? (findVideoInImages() || findVideoInHtml()) : null

    if (promoted?.url) {
      next.videoUrl = promoted.url
      if (promoted.caption) next.imageAlt = promoted.caption
    }

    if (adminSaysImage && !adminSaysVideo) {
      // Keep featured image as hero; body videos stay in images[] / contentHtml
      next.mediaType = 'image'
      next.featuredMediaType = 'image'
      next.videoUrl = ''
    } else if (next.videoUrl && String(next.videoUrl).trim().length > 5) {
      next.mediaType = 'video'
      next.featuredMediaType = 'video'
      next.hasThumbnail = true
    }

    if (isForcedTopVideo) {
      next.videoPlacement = 'center'
      next.videoSize = 'big'
      next.mediaType = next.videoUrl ? 'video' : next.mediaType
      next.featuredMediaType = next.videoUrl ? 'video' : next.featuredMediaType
      next.hasThumbnail = next.videoUrl ? true : next.hasThumbnail
    }

    return next
  })()

  const hasExplicitNoImages = (Array.isArray(articleForMedia.images) && articleForMedia.images.length === 0 && !articleForMedia.imageUrl)
  const localFallback = hasExplicitNoImages
    ? null
    : (articleImagesMap[id] || articleImagesMap[articleForMedia.id] || articleForMedia.heroImage || null)
  const mediaInfo = resolveArticleMedia(articleForMedia, localFallback)
  const hasInlineImage = !mediaInfo.isText && !mediaInfo.isVideo && !!mediaInfo.posterUrl

  // Gather all available story images for fallback paragraph mode & rich renderer
  const allStoryImages = []
  if (Array.isArray(articleForMedia.images) && articleForMedia.images.length > 0) {
    articleForMedia.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url
      if (url && !allStoryImages.some((x) => isSameImage(x.url, url))) {
        // Never re-inject the hero video (or its poster) as a floated body clip
        if (
          mediaInfo.isVideo &&
          (isVideoUrl(url) ||
            isSameImage(url, mediaInfo.videoThumbnailUrl) ||
            isSameImage(url, mediaInfo.posterUrl) ||
            isSameImage(url, mediaInfo.videoUrl) ||
            isSameImage(url, mediaInfo.deliveryVideoUrl) ||
            isSameImage(url, mediaInfo.playableVideoUrl))
        ) {
          return
        }
        const isBedHotspot = article.id === 'bed-hotspot' || id === 'bed-hotspot'
        const adminCaption =
          typeof img === 'object' && img.caption !== undefined
            ? img.caption
            : (typeof img === 'object' && img.alt ? img.alt : '')
        // Default zigzag L/R so stories don't stack every figure on the left.
        // Explicit admin placement still wins when set.
        const zigzagPlacement = allStoryImages.length % 2 === 0 ? 'left' : 'right'
        const adminPlacement =
          typeof img === 'object' && img.placement ? String(img.placement).toLowerCase() : ''

        allStoryImages.push({
          url,
          caption: adminCaption || '',
          alt: (typeof img === 'object' && (img.alt || img.caption)) || '',
          placement: isBedHotspot
            ? (allStoryImages.length % 2 === 0 ? 'right' : 'left')
            : (adminPlacement === 'left' || adminPlacement === 'right' || adminPlacement === 'center'
                ? adminPlacement
                : zigzagPlacement),
          size: isBedHotspot ? 'small' : ((typeof img === 'object' && img.size) || 'small'),
          type: typeof img === 'object' && img.type ? img.type : (isVideoUrl(url) ? 'video' : 'image'),
          afterHeading: typeof img === 'object' ? (img.afterHeading || '') : ''
        })
      }
    })
  }

  const isHeroVideoClip = (img) => {
    const url = img.url || ''
    return (
      isVideoUrl(url) ||
      img.type === 'video' ||
      isSameImage(url, mediaInfo.videoUrl) ||
      isSameImage(url, mediaInfo.deliveryVideoUrl) ||
      isSameImage(url, mediaInfo.playableVideoUrl) ||
      isSameImage(url, mediaInfo.posterUrl) ||
      isSameImage(url, mediaInfo.videoThumbnailUrl)
    )
  }

  // Dare to Dream: never leave the hero video as a floated body clip at the bottom
  if (article.id === 'dare-to-dream' || id === 'dare-to-dream') {
    for (let i = allStoryImages.length - 1; i >= 0; i -= 1) {
      if (isHeroVideoClip(allStoryImages[i])) allStoryImages.splice(i, 1)
    }
  }

  // Pin Manjulaa visionary portrait under "The heart and soul of Swayamkrushi" (right).
  // Drop any old bottom portrait + do not re-inject the hero video as a floated body clip.
  if (article.id === 'home-of-care' || id === 'home-of-care') {
    const isManjulaaPortrait = (img) => {
      const cap = `${img.caption || ''} ${img.alt || ''}`.toLowerCase()
      const url = String(img.url || '').toLowerCase()
      return (
        cap.includes('heart and soul') ||
        cap.includes('visionary') ||
        cap.includes('manjulaa kalyaan, founder') ||
        url.includes('xg9qemgyszqdhbsjymy8') ||
        url.includes('diizcur6lyalwamfkie3') ||
        url.includes('manjulaa-visionary-home-of-care')
      )
    }
    for (let i = allStoryImages.length - 1; i >= 0; i -= 1) {
      if (isManjulaaPortrait(allStoryImages[i]) || isHeroVideoClip(allStoryImages[i])) {
        allStoryImages.splice(i, 1)
      }
    }
    allStoryImages.push({ ...HOME_OF_CARE_VISIONARY })
  }

  // Only use article thumbnail/poster as fallback if NO story images exist, article is not a video or text-only, and no rich HTML content exists
  if (allStoryImages.length === 0 && !mediaInfo.isVideo && !mediaInfo.isText && !article.contentHtml) {
    const thumbUrl = (hasInlineImage && mediaInfo.posterUrl) || article.imageUrl || localFallback
    const isMockOrPlaceholder =
      thumbUrl &&
      (thumbUrl.toLowerCase().includes('.svg') ||
        thumbUrl.toLowerCase().includes('/mocks/') ||
        thumbUrl.toLowerCase().includes('placeholder'))

    if (thumbUrl && !isMockOrPlaceholder) {
      allStoryImages.push({
        url: thumbUrl,
        caption: article.imageAlt || '',
        alt: article.imageAlt || article.title,
        placement: 'left',
        size: 'small'
      })
    }
  }

  // Cover imageAlt only fills an empty still-image caption — never overwrite video captions
  if (!mediaInfo.isVideo && article.imageAlt && allStoryImages.length > 0) {
    const firstStillIdx = allStoryImages.findIndex(
      (img) => img.type !== 'video' && !isVideoUrl(img.url)
    )
    if (firstStillIdx >= 0) {
      const firstStill = allStoryImages[firstStillIdx]
      const sourceImg =
        Array.isArray(article.images) &&
        article.images.find((img) => {
          const url = typeof img === 'string' ? img : img?.url
          return url && isSameImage(url, firstStill.url)
        })
      const hasExplicitCaption =
        sourceImg && typeof sourceImg === 'object' && sourceImg.caption !== undefined
      if (!hasExplicitCaption && (!firstStill.caption || firstStill.caption.trim() === '')) {
        allStoryImages[firstStillIdx].caption = article.imageAlt
      }
    }
  }

  const getArticleHash = (str = '') => {
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  const seed = getArticleHash((article.id || id || '') + ':' + (article.title || ''))
  const startsRight = seed % 2 === 0
  const totalParas = allParagraphs.length

  const hasEmbeddedVideo = Boolean(mediaInfo.isVideo && mediaInfo.videoUrl)
  const isDairy = article.id === 'story-dairy' || id === 'story-dairy'
  const initialPara = isDairy
    ? (totalParas >= 3 ? 2 : 1)
    : (hasEmbeddedVideo
        ? (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : (totalParas <= 4 ? 1 : 1 + (seed % 2)))
        : (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : 1))

  const remainingParas = Math.max(0, totalParas - 1 - initialPara)
  const remainingImages = Math.max(1, allStoryImages.length - 1)
  const dynamicStep = Math.max(2, Math.min(5, Math.floor(remainingParas / remainingImages)))

  const imagePlacementMap = {}
  let prevParaTarget = 0

  allStoryImages.forEach((imgObj, imgIdx) => {
    let targetPara = 0
    if (imgIdx === 0) {
      targetPara = Math.min(totalParas - 1, initialPara)
    } else {
      const stepVariance = (seed >> (imgIdx + 1)) % 2
      const spacing = Math.max(2, dynamicStep + stepVariance)
      // Always leave text between media — never stack on consecutive paragraphs
      targetPara = Math.min(totalParas - 1, Math.max(prevParaTarget + 2, prevParaTarget + spacing))
    }

    if (imgObj.afterHeading) {
      const needle = String(imgObj.afterHeading).toLowerCase().trim()
      const headingIdx = allParagraphs.findIndex((p) => {
        const text = String(p || '').replace(/\s+/g, ' ').trim().toLowerCase()
        return text === needle || (text.includes(needle) && text.length < 100)
      })
      if (headingIdx >= 0) {
        targetPara = Math.min(totalParas - 1, headingIdx + 1)
      }
    }

    prevParaTarget = targetPara

    const zigzagAlign = imgIdx % 2 === 0 ? 'float-left' : 'float-right'
    const alignClass = isDairy
      ? 'float-left'
      : (imgObj.placement
          ? (imgObj.placement === 'right' ? 'float-right' : imgObj.placement === 'center' ? 'float-center' : 'float-left')
          : zigzagAlign)
    const sizeClass = imgObj.size === 'big' ? 'size-big' : 'size-small'

    if (!imagePlacementMap[targetPara]) imagePlacementMap[targetPara] = []
    imagePlacementMap[targetPara].push({
      ...imgObj,
      alignClass,
      sizeClass
    })
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://swayamkrushi.org/#/article/${article.id}`
    },
    'headline': article.title,
    'description': article.excerpt || article.title,
    'author': {
      '@type': 'Organization',
      'name': article.attribution || 'Swayamkrushi Archives'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Swayamkrushi',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://swayamkrushi.org/assets/images/logo.png'
      }
    },
    'articleSection': article.category || 'Special Report',
    'inLanguage': 'en-IN'
  }

  return (
    <article className="article-page-wrap">
      <SEO
        title={article.title}
        description={article.excerpt || `${article.title} - Swayamkrushi Special Archives.`}
        keywords={`Swayamkrushi, ${article.category || 'Special Report'}, ${article.title}, special education Hyderabad`}
        canonicalUrl={`https://swayamkrushi.org/#/article/${article.id}`}
        ogType="article"
        author={article.attribution || 'Swayamkrushi'}
        schema={articleSchema}
      />

      {/* Editorial Header */}
      <header className="article-editorial-header">
        {(article.id === 'story-champions' || article.quote) && (
          <div className="article-quote-box-above-title">
            <p className="article-quote-box-text">
              {article.quote ||
                'Every life at Swayamkrushi is a story of courage, growth, and achievement. Here are just a few of the journeys that inspire us every day.'}
            </p>
          </div>
        )}
        <h1 className="article-headline">{article.title}</h1>
      </header>

      {/* Cartesia AI Voice Narration Listen Bar */}
      <ArticleAudioPlayer article={article} />

      {/* Featured Hero Video (Only if story is a video) */}
      {!mediaInfo.isText && mediaInfo.isVideo && mediaInfo.videoUrl && (() => {
        const isTopBigVideo =
          article.id === 'home-of-care' ||
          id === 'home-of-care' ||
          article.id === 'dare-to-dream' ||
          id === 'dare-to-dream'
        const isDairy = article.id === 'story-dairy' || id === 'story-dairy'
        const isPortrait = !isTopBigVideo && (isDairy || article.videoAspect === 'portrait' || article.videoAspect === '9/16')
        // Dare to Dream + Home of Care: always full-width hero at the top
        // Dairy: always float portrait video on the right with text flowing on the left
        const placement = isTopBigVideo
          ? 'center'
          : (isDairy
              ? 'right'
              : (articleForMedia.videoPlacement || article.videoPlacement || (isPortrait ? 'right' : 'center')))
        const sizeClass = isTopBigVideo
          ? 'size-big'
          : (isDairy || isPortrait || articleForMedia.videoSize === 'small' || article.videoSize === 'small'
              ? 'size-small'
              : 'size-big')
        const heroCaption = articleForMedia.imageAlt || article.imageAlt

        return (
          <figure
            className={`article-hero-figure article-hero-video-figure float-${placement} ${sizeClass} ${
              isPortrait ? 'is-portrait-video' : ''
            }`}
            data-is-video="true"
          >
            <div className="article-video-player-container">
              <VideoPlayer
                src={mediaInfo.deliveryVideoUrl || mediaInfo.videoUrl}
                poster={mediaInfo.posterUrl || undefined}
                title={article.title}
                category={article.category || 'Featured Story'}
                aspectRatio={isPortrait ? '9/16' : '16/9'}
                objectFit={mediaInfo.videoUrl && mediaInfo.videoUrl.includes('vcuwit1kzoa5rvnc2zee') ? 'cover' : (isPortrait ? 'cover' : 'contain')}
              />
            </div>
            {(heroCaption !== undefined ? heroCaption : `Video spotlight: ${article.title}`) ? (
              <figcaption className="article-hero-caption">
                {heroCaption !== undefined ? heroCaption : `Video spotlight: ${article.title}`}
              </figcaption>
            ) : null}
          </figure>
        )
      })()}

      {/* Main Editorial Story Flow: Supports Rich Text, Embedded Images & Custom Pro Video Players */}
      <div className="article-editorial-body">
        {article.contentHtml ? (
          <ArticleContentRenderer
            htmlContent={article.contentHtml}
            articleTitle={article.title}
            articleId={article.id || id}
            inlineMedia={mediaInfo}
            localFallback={localFallback}
            imageAlt={article.imageAlt}
            hasVideo={hasEmbeddedVideo}
            storyImages={allStoryImages}
          />
        ) : (
          allParagraphs.map((para, idx) => {
            const imgsForThisPara = imagePlacementMap[idx] || []
            const paraEl = (
              <p key={`para-text-${idx}`} className={idx === 0 ? 'first-body-paragraph' : ''}>
                {para}
              </p>
            )

            const mediaEls = imgsForThisPara.map((imgObj, subIdx) => {
              const isVid = isVideoUrl(imgObj.url)
              const isBedHotspot = article.id === 'bed-hotspot' || id === 'bed-hotspot'
              const alignClass = isBedHotspot
                ? (subIdx % 2 === 0 ? 'float-right' : 'float-left')
                : imgObj.alignClass
              const sizeClass = isBedHotspot ? 'size-small' : (imgObj.sizeClass || 'size-small')
              const isSideFloat =
                sizeClass !== 'size-big' &&
                alignClass !== 'float-center' &&
                (alignClass === 'float-left' || alignClass === 'float-right')

              return {
                isSideFloat,
                alignClass,
                node: (
                  <figure
                    key={`para-img-${idx}-${subIdx}`}
                    className={`article-inline-figure ${alignClass} ${sizeClass} ${isVid ? 'article-inline-video-figure' : ''}${isSideFloat ? ' in-float-pair' : ''}`}
                  >
                    {isVid ? (
                      <div className="article-video-player-container">
                        <VideoPlayer
                          src={imgObj.url}
                          poster={imgObj.poster || undefined}
                          autoPlay={false}
                          title={imgObj.title || imgObj.caption || article.title}
                          subtitle={imgObj.subtitle}
                          category={imgObj.title || "Story Clip"}
                        />
                      </div>
                    ) : (
                      <img
                        src={imgObj.url}
                        alt={imgObj.caption || article.title}
                        className="article-inline-img"
                        onError={(e) => {
                          if (localFallback && e.target.src !== localFallback && !localFallback.toLowerCase().includes('.svg')) {
                            e.target.src = localFallback
                          } else {
                            const fig = e.target.closest('figure')
                            if (fig) fig.style.display = 'none'
                          }
                        }}
                      />
                    )}
                    {imgObj.caption ? (
                      <figcaption className="article-inline-caption">
                        {imgObj.title && imgObj.subtitle ? (
                          <>
                            <strong>{imgObj.title}</strong> &mdash; <span>{imgObj.subtitle}</span>
                          </>
                        ) : (
                          imgObj.caption
                        )}
                      </figcaption>
                    ) : null}
                  </figure>
                )
              }
            })

            // Pair the first side-floated media with this paragraph so text never wraps under it
            const firstSideIdx = mediaEls.findIndex((m) => m.isSideFloat)
            let bodyBlock
            if (firstSideIdx >= 0) {
              const side = mediaEls[firstSideIdx].alignClass === 'float-right' ? 'is-right' : 'is-left'
              const before = mediaEls.slice(0, firstSideIdx).map((m) => m.node)
              const pairedMedia = mediaEls[firstSideIdx].node
              const after = mediaEls.slice(firstSideIdx + 1).map((m) => m.node)
              bodyBlock = (
                <>
                  {before}
                  <div className={`article-float-pair ${side}`}>
                    {pairedMedia}
                    <div className="article-float-pair-text">{paraEl}</div>
                  </div>
                  {after}
                </>
              )
            } else {
              bodyBlock = (
                <>
                  {mediaEls.map((m) => m.node)}
                  {paraEl}
                </>
              )
            }

            return (
              <Fragment key={idx}>
                {bodyBlock}

                {/* Editorial callout after paragraph 2 matching classic broadsheet style */}
                {idx === 2 && allParagraphs.length > 4 && (
                  <aside className="editorial-also-read">
                    <span className="also-read-tag">Also read:</span>
                    <Link to="/article/story-encounter" className="also-read-link">
                      Chance encounter that changed my life &mdash; Manjulaa Kalyaan
                    </Link>
                  </aside>
                )}
              </Fragment>
            )
          })
        )}
      </div>

      {/* 4 Bottom Editorial Section Boxes: Manjula's Musings, Activities galore, Fun facts, Winning hearts */}
      <section className="article-bottom-sections" aria-label="Explore Swayamkrushi Editorial Sections">
        <div className="bottom-sections-header">
          <h3 className="bottom-sections-main-heading">Explore Swayamkrushi Stories</h3>
        </div>
        <div className="bottom-sections-grid">
          {EDITORIAL_SECTIONS.map((sec) => (
            <div key={sec.title} className="bottom-section-box">
              <div className="bottom-section-box-header">
                <h4 className="bottom-section-title">{sec.title}</h4>
                <span className="bottom-section-count">{sec.articles.length} stories</span>
              </div>
              <ul className="bottom-section-list">
                {sec.articles
                  .filter((item) => !isIdDeleted('article', item.id) && !isIdDeleted('article', item.alias))
                  .map((item) => {
                  const isCurrent = id === item.id || (item.alias && id === item.alias)
                  return (
                    <li key={item.id} className={`bottom-section-item ${isCurrent ? 'is-current' : ''}`}>
                      <Link
                        to={`/article/${item.id}`}
                        className="bottom-section-link"
                      >
                        <span className="bullet-icon" aria-hidden="true">&#10022;</span>
                        <span className="article-link-text">{item.title}</span>
                        {isCurrent && <span className="reading-tag">(Reading)</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

    </article>
  )
}
