import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getArticleById, allArticles, articleImagesMap } from '../data/allArticles'
import { fetchArticleById } from '../services/api'
import ArticleAudioPlayer from '../components/ArticleAudioPlayer'
import ArticleContentRenderer from '../components/ArticleContentRenderer'
import VideoPlayer from '../components/VideoPlayer'
import { resolveArticleMedia } from '../utils/mediaUtils'
import SEO from '../components/SEO'
import './ArticlePage.css'

export default function ArticlePage({ defaultId }) {
  const { id: paramId } = useParams()
  const id = paramId || defaultId || 'story-encounter'
  const navigate = useNavigate()
  const localArticle = getArticleById(id)
  const [article, setArticle] = useState(localArticle)
  const [isSaved, setIsSaved] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isAudioOpen, setIsAudioOpen] = useState(false)

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2200)
    }
  }

  // Clean all paragraphs
  const allParagraphs = (article.paragraphs && article.paragraphs.length > 0)
    ? article.paragraphs
    : [article.excerpt]

  const fullArticleSpeechText = `${article.title}. ${allParagraphs.join(' ')}`

  // Find 3 related articles for bottom recommendations
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3)

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
        <div className="article-category-badge">
          <span className="badge-dot" />
          <span>{article.category || 'SPECIAL REPORT'}</span>
        </div>

        <h1 className="article-headline">{article.title}</h1>

        {/* Metadata Byline & Action Icons */}
        <div className="article-meta-row">
          <div className="article-byline-group">
            <span className="article-author">
              {article.attribution ? `By ${article.attribution}` : 'By SWAYAMKRUSHI ARCHIVES'}
            </span>
            <span className="article-date">Published in Swayamkrushi Archives</span>
          </div>

          <div className="article-actions-group">
            <button
              type="button"
              className={`bbc-action-btn ${isAudioOpen ? 'is-audio-active' : ''}`}
              onClick={() => setIsAudioOpen((prev) => !prev)}
              title={isAudioOpen ? 'Hide audio player' : 'Listen to article (Inworld AI)'}
            >
              <span>{isAudioOpen ? 'Listening' : 'Listen'}</span>
              <svg
                className="bbc-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>

            <button
              type="button"
              className="bbc-action-btn"
              onClick={handleShare}
              title="Share article"
            >
              <span>{isCopied ? 'Copied' : 'Share'}</span>
              <svg
                className="bbc-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>

            <button
              type="button"
              className={`bbc-action-btn ${isSaved ? 'is-saved' : ''}`}
              onClick={() => setIsSaved((prev) => !prev)}
              title={isSaved ? 'Saved' : 'Save article'}
            >
              <span>{isSaved ? 'Saved' : 'Save'}</span>
              <svg
                className="bbc-icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Inworld AI Audio Reader */}
        {isAudioOpen && (
          <ArticleAudioPlayer
            articleTitle={article.title}
            articleText={fullArticleSpeechText}
            onClose={() => setIsAudioOpen(false)}
          />
        )}
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
                Video spotlight: {article.title} &mdash; Swayamkrushi Archives.
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
                Archival spotlight: {article.title} &mdash; Swayamkrushi, Secunderabad.
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

      {/* Bottom Back Button & Navigation */}
      <div className="article-bottom-bar">
        <Link to="/" className="back-home-pill">
          ← Back to Swayamkrushi Home
        </Link>
      </div>

      {/* Related Stories Grid */}
      <section className="article-related-section">
        <h3 className="related-section-title">More From Swayamkrushi</h3>
        <div className="related-grid">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.id}
              to={`/article/${rel.id}`}
              className="related-story-card"
            >
              <h4 className="related-story-title">{rel.title}</h4>
              <p className="related-story-excerpt">{rel.excerpt}</p>
              <span className="related-story-link">Read full story &rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}
