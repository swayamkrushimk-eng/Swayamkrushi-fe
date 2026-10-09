import { useEffect, useState } from 'react'
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

      {/* Featured Hero Media (Image or Custom Video Player) */}
      {(() => {
        const localFallback = articleImagesMap[id] || articleImagesMap[article.id] || article.heroImage || null
        const mediaInfo = resolveArticleMedia(article, localFallback)

        if (mediaInfo.isText) return null

        if (mediaInfo.isVideo && mediaInfo.videoUrl) {
          return (
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
          )
        }

        if (mediaInfo.posterUrl) {
          return (
            <figure className="article-hero-figure">
              <img
                src={mediaInfo.posterUrl}
                alt={article.title}
                className="article-hero-img"
                onError={(e) => {
                  if (localFallback && e.target.src !== localFallback) {
                    e.target.src = localFallback
                  }
                }}
              />
              <figcaption className="article-hero-caption">
                Archival spotlight: {article.title}
              </figcaption>
            </figure>
          )
        }

        return null
      })()}

      {/* Main Editorial Story Flow: Supports Rich Text, Embedded Images & Custom Pro Video Players */}
      <div className="article-editorial-body">
        {article.contentHtml ? (
          <ArticleContentRenderer
            htmlContent={article.contentHtml}
            articleTitle={article.title}
          />
        ) : (
          allParagraphs.map((para, idx) => (
            <div key={idx}>
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
            </div>
          ))
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
