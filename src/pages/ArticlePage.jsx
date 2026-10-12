import { useEffect, useState, Fragment } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getArticleById, articleImagesMap } from '../data/allArticles'
import { fetchArticleById, isIdDeleted } from '../services/api'
import ArticleContentRenderer from '../components/ArticleContentRenderer'
import VideoPlayer from '../components/VideoPlayer'
import { resolveArticleMedia, isSameImage, isVideoUrl } from '../utils/mediaUtils'
import SEO from '../components/SEO'
import ArticleAudioPlayer from '../components/ArticleAudioPlayer'
import './ArticlePage.css'

const EDITORIAL_SECTIONS = [
  {
    title: 'Building Blocks',
    articles: [
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
      { id: 'story-champions', title: 'Champions All the Way — Special Olympics' },
    ],
  },
]

export default function ArticlePage({ defaultId }) {
  const { id: paramId } = useParams()
  const id = paramId || defaultId || 'story-encounter'
  const navigate = useNavigate()
  const localArticle = isIdDeleted('article', id) ? null : getArticleById(id)
  const [article, setArticle] = useState(localArticle)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (isIdDeleted('article', id)) {
      setArticle(null)
      return
    }
    const local = getArticleById(id)
    setArticle(local)
    fetchArticleById(id).then((data) => {
      if (data && data.title && !isIdDeleted('article', id)) {
        setArticle(data)
      }
    })
  }, [id])

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

  const hasExplicitNoImages = (Array.isArray(article.images) && article.images.length === 0 && !article.imageUrl)
  const localFallback = hasExplicitNoImages
    ? null
    : (articleImagesMap[id] || articleImagesMap[article.id] || article.heroImage || null)
  const mediaInfo = resolveArticleMedia(article, localFallback)
  const hasInlineImage = !mediaInfo.isText && !mediaInfo.isVideo && !!mediaInfo.posterUrl

  // Gather all available story images for fallback paragraph mode & rich renderer
  const allStoryImages = []
  if (Array.isArray(article.images) && article.images.length > 0) {
    article.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url
      if (url && !allStoryImages.some((x) => isSameImage(x.url, url))) {
        // If article has a hero video, do not include the video thumbnail / poster / video url as a body story image
        if (
          mediaInfo.isVideo &&
          (isSameImage(url, mediaInfo.videoThumbnailUrl) ||
            isSameImage(url, mediaInfo.posterUrl) ||
            isSameImage(url, mediaInfo.videoUrl))
        ) {
          return
        }
        const isBedHotspot = article.id === 'bed-hotspot' || id === 'bed-hotspot'
        const bedHotspotMeta = isBedHotspot
          ? [
              {
                title: 'M Sarada (Principal)',
                caption: 'An overview...Principal Sarada speaks about the B.ED course'
              },
              {
                title: 'PVB Sudhakar (HoD)',
                caption: 'Direct from the Head....Sudhakar gives an intro'
              }
            ][allStoryImages.length % 2]
          : null

        allStoryImages.push({
          url,
          caption: bedHotspotMeta
            ? `${bedHotspotMeta.title} — ${bedHotspotMeta.caption}`
            : ((typeof img === 'object' && (img.caption || img.alt)) || ''),
          alt: bedHotspotMeta
            ? bedHotspotMeta.title
            : ((typeof img === 'object' && (img.alt || img.caption)) || ''),
          placement: isBedHotspot
            ? (allStoryImages.length % 2 === 0 ? 'right' : 'left')
            : ((typeof img === 'object' && img.placement) || 'left'),
          size: isBedHotspot ? 'small' : ((typeof img === 'object' && img.size) || 'small'),
          title: bedHotspotMeta?.title,
          subtitle: bedHotspotMeta?.caption
        })
      }
    })
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

  // If there's an imageAlt and the first image has no custom caption, use imageAlt for it (only for non-video articles)
  if (!mediaInfo.isVideo && article.imageAlt && allStoryImages.length > 0 && (!allStoryImages[0].caption || allStoryImages[0].caption.trim() === '')) {
    allStoryImages[0].caption = article.imageAlt
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
  const initialPara = hasEmbeddedVideo
    ? (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : (totalParas <= 4 ? 1 : 1 + (seed % 2)))
    : (totalParas <= 2 ? (totalParas === 2 ? 1 : 0) : 1)

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
      targetPara = Math.min(totalParas - 1, prevParaTarget + spacing)
    }
    prevParaTarget = targetPara

    const alignClass = imgObj.placement
      ? (imgObj.placement === 'right' ? 'float-right' : imgObj.placement === 'center' ? 'float-center' : 'float-left')
      : (imgIdx % 2 === 0 ? (startsRight ? 'float-right' : 'float-left') : (!startsRight ? 'float-right' : 'float-left'))
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
      {!mediaInfo.isText && mediaInfo.isVideo && mediaInfo.videoUrl && (
        <figure
          className={`article-hero-figure article-hero-video-figure ${
            article.videoPlacement ? `float-${article.videoPlacement}` : 'float-center'
          } ${article.videoSize === 'small' ? 'size-small' : 'size-big'}`}
          data-is-video="true"
        >
          <div className="article-video-player-container">
            <VideoPlayer
              src={mediaInfo.deliveryVideoUrl || mediaInfo.videoUrl}
              poster={mediaInfo.posterUrl || undefined}
              title={article.title}
              category={article.category || 'Featured Story'}
              autoPlay={false}
            />
          </div>
          <figcaption className="article-hero-caption">
            {article.imageAlt || `Video spotlight: ${article.title}`}
          </figcaption>
        </figure>
      )}

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

            return (
              <Fragment key={idx}>
                {imgsForThisPara.map((imgObj, subIdx) => {
                  const isVid = isVideoUrl(imgObj.url)
                  const isBedHotspot = article.id === 'bed-hotspot' || id === 'bed-hotspot'
                  const alignClass = isBedHotspot
                    ? (subIdx % 2 === 0 ? 'float-right' : 'float-left')
                    : imgObj.alignClass
                  const sizeClass = isBedHotspot ? 'size-small' : (imgObj.sizeClass || 'size-small')

                  return (
                    <figure
                      key={`para-img-${idx}-${subIdx}`}
                      className={`article-inline-figure ${alignClass} ${sizeClass} ${isVid ? 'article-inline-video-figure' : ''}`}
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
                })}

                <p className={idx === 0 ? 'first-body-paragraph' : ''}>{para}</p>

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
