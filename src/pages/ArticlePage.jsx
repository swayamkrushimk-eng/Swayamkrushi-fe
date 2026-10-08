import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getArticleById, allArticles, articleImagesMap } from '../data/allArticles'
import { fetchArticleById } from '../services/api'
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
