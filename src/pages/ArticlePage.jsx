import { useEffect, useState, Fragment } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getArticleById, articleImagesMap } from '../data/allArticles'
import { fetchArticleById } from '../services/api'
import ArticleContentRenderer from '../components/ArticleContentRenderer'
import VideoPlayer from '../components/VideoPlayer'
import { resolveArticleMedia } from '../utils/mediaUtils'
import SEO from '../components/SEO'
import './ArticlePage.css'

const EDITORIAL_SECTIONS = [
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
  const localArticle = getArticleById(id)
  const [article, setArticle] = useState(localArticle)

  useEffect(() => {
    window.scrollTo(0, 0)
    const local = getArticleById(id)
    setArticle(local)
    fetchArticleById(id).then((data) => {
      if (data && data.title) {
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

  const localFallback = articleImagesMap[id] || articleImagesMap[article.id] || article.heroImage || null
  const mediaInfo = resolveArticleMedia(article, localFallback)
  const hasInlineImage = !mediaInfo.isText && !mediaInfo.isVideo && !!mediaInfo.posterUrl

  // Gather all available story images for fallback paragraph mode
  const allStoryImages = []
  if (Array.isArray(article.images) && article.images.length > 0) {
    article.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url
      if (url && !allStoryImages.some((x) => x.url === url)) {
        allStoryImages.push({
          url,
          caption: (typeof img === 'object' && (img.caption || img.alt)) || ''
        })
      }
    })
  }
  if (hasInlineImage && !allStoryImages.some((x) => x.url === mediaInfo.posterUrl)) {
    allStoryImages.push({
      url: mediaInfo.posterUrl,
      caption: article.imageAlt || ''
    })
  }
  if (article.imageUrl && !allStoryImages.some((x) => x.url === article.imageUrl)) {
    allStoryImages.push({
      url: article.imageUrl,
      caption: article.imageAlt || ''
    })
  }
  if (localFallback && allStoryImages.length === 0) {
    allStoryImages.push({
      url: localFallback,
      caption: article.imageAlt || ''
    })
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

  const imagePlacementMap = {}
  let prevParaTarget = 0

  allStoryImages.forEach((imgObj, imgIdx) => {
    let targetPara = 0
    if (imgIdx === 0) {
      if (totalParas <= 1) {
        targetPara = 0
      } else if (totalParas === 2) {
        targetPara = seed % 2
      } else {
        targetPara = seed % 3
      }
    } else {
      const spacing = 2 + ((seed >> (imgIdx + 1)) % 2)
      targetPara = Math.min(totalParas - 1, prevParaTarget + spacing)
    }
    prevParaTarget = targetPara

    const isRight = imgIdx % 2 === 0 ? startsRight : !startsRight
    const alignClass = isRight ? 'float-right' : 'float-left'

    if (!imagePlacementMap[targetPara]) imagePlacementMap[targetPara] = []
    imagePlacementMap[targetPara].push({
      ...imgObj,
      alignClass
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
        <h1 className="article-headline">{article.title}</h1>
      </header>

      {/* Featured Hero Video (Only if story is a video) */}
      {!mediaInfo.isText && mediaInfo.isVideo && mediaInfo.videoUrl && (
        <figure className="article-hero-figure article-hero-video-figure">
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
            Video spotlight: {article.title}
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
            inlineMedia={hasInlineImage ? mediaInfo : null}
            localFallback={localFallback}
            imageAlt={article.imageAlt}
          />
        ) : (
          allParagraphs.map((para, idx) => {
            const imgsForThisPara = imagePlacementMap[idx] || []

            return (
              <Fragment key={idx}>
                {imgsForThisPara.map((imgObj, subIdx) => {
                  return (
                    <figure
                      key={`para-img-${idx}-${subIdx}`}
                      className={`article-inline-figure ${imgObj.alignClass}`}
                    >
                      <img
                        src={imgObj.url}
                        alt={imgObj.caption || article.title}
                        className="article-inline-img"
                        onError={(e) => {
                          if (localFallback && e.target.src !== localFallback) {
                            e.target.src = localFallback
                          }
                        }}
                      />
                      {imgObj.caption ? (
                        <figcaption className="article-inline-caption">
                          {imgObj.caption}
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
                {sec.articles.map((item) => {
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
