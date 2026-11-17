import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { leftSideArticles, rightSideArticles } from '../data/articlesData'
import { allArticles } from '../data/allArticles'
import { fetchArticles, fetchMediaBuzz, isIdDeleted } from '../services/api'
import ArticleCard from './ArticleCard'

const HOME_NEWS_IDS = [
  'deccan-chronicle-epaper-2026-11-17',
  'hindu-former-vp-youth-social-initiatives-2026-11-16',
  'youtube-abn-seethakka'
]

const HOME_NEWS_FALLBACKS = {
  'deccan-chronicle-epaper-2026-11-17': {
    id: 'deccan-chronicle-epaper-2026-11-17',
    title: 'Deccan Chronicle E-Paper: Swayamkrushi in Focus',
    outlet: 'Deccan Chronicle',
    date: '17/11/2026',
    excerpt: 'Deccan Chronicle e-paper edition featuring coverage of Swayamkrushi’s work and celebrations.',
    articleUrl: 'https://share.google/6xjNHQ8PHIW1ejbVX'
  },
  'hindu-former-vp-youth-social-initiatives-2026-11-16': {
    id: 'hindu-former-vp-youth-social-initiatives-2026-11-16',
    title: 'Former VP Urges Youth to Take Part in Meaningful Social Initiatives',
    outlet: 'The Hindu',
    date: '16/11/2026',
    excerpt: 'Former Vice-President M. Venkaiah Naidu urges youth to join meaningful social initiatives at Swayamkrushi’s Coral Jubilee, as Minister Seethakka visits the campus.',
    articleUrl: 'https://www.thehindu.com/news/cities/Hyderabad/former-vp-urges-youth-to-take-part-in-meaningful-social-initiatives/article71708164.ece'
  },
  'youtube-abn-seethakka': {
    id: 'youtube-abn-seethakka',
    title: 'Minister Seethakka Visited Swayamkrushi Organization in Jawaharnagar | Hyderabad',
    outlet: 'ABN Telugu',
    date: '2026',
    excerpt: 'ABN Telugu reports on Minister Seethakka’s visit to the Swayamkrushi organisation in Jawaharnagar, Hyderabad.',
    video: 'https://www.youtube.com/watch?v=PWe1PCnOCdM',
    articleUrl: 'https://youtu.be/PWe1PCnOCdM',
    videoThumbnailUrl: 'https://img.youtube.com/vi/PWe1PCnOCdM/hqdefault.jpg'
  }
}

function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return null
  const m = url.match(
    /(?:youtube\.com\/watch\?[^#]*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/i
  )
  return m ? m[1] : null
}

function youtubeThumb(url) {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

function youtubeEmbed(url, autoplay = false) {
  const id = getYouTubeId(url)
  if (!id) return null
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`
}

function pickHomeNews(items) {
  const list = Array.isArray(items) ? items : []
  return HOME_NEWS_IDS.map((id) => {
    if (isIdDeleted('media_buzz', id)) return null
    const fromApi = list.find((a) => a.id === id || a._id === id)
    const base = fromApi || HOME_NEWS_FALLBACKS[id]
    if (!base) return null
    const video = base.video || ''
    const thumb =
      base.image ||
      base.imageUrl ||
      base.videoThumbnailUrl ||
      youtubeThumb(video) ||
      youtubeThumb(base.articleUrl) ||
      null
    return {
      ...HOME_NEWS_FALLBACKS[id],
      ...base,
      image: thumb,
      isVideo: Boolean(video || /youtu(\.be|be\.com)/i.test(base.articleUrl || ''))
    }
  }).filter(Boolean)
}

export default function FunFactsRail() {
  const [apiArticles, setApiArticles] = useState([])
  const [newsItems, setNewsItems] = useState([])
  const [playingNewsId, setPlayingNewsId] = useState(null)

  useEffect(() => {
    fetchArticles().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setApiArticles(data)
      }
    })

    const onUpdate = (e) => {
      if (e.detail?.data && Array.isArray(e.detail.data)) {
        setApiArticles(e.detail.data)
      }
    }
    window.addEventListener('swayamkrushi_articles_updated', onUpdate)
    return () => window.removeEventListener('swayamkrushi_articles_updated', onUpdate)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchMediaBuzz()
      .then((data) => {
        if (cancelled) return
        setNewsItems(pickHomeNews(Array.isArray(data) ? data : []))
      })
      .catch(() => {
        if (!cancelled) setNewsItems(pickHomeNews([]))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const findArticle = (id, fallbackIds = []) => {
    const ids = [id, ...fallbackIds]
    for (const testId of ids) {
      if (isIdDeleted('article', testId)) continue
      const fromApi = apiArticles.find((a) => a.id === testId)
      if (fromApi) return fromApi
      const fromLeft = leftSideArticles.find((a) => a.id === testId)
      if (fromLeft) return fromLeft
      const fromRight = rightSideArticles.find((a) => a.id === testId)
      if (fromRight) return fromRight
      const fromAll = allArticles.find((a) => a.id === testId)
      if (fromAll) return fromAll
    }
    return null
  }

  // 1. Fun facts articles (5 items in exact requested order)
  const funFactsConfig = [
    { id: 'story-sai-baba' },
    { id: 'story-thinking' },
    { id: 'story-visa' },
    { id: 'story-kadiam' },
    { id: 'story-dairy' }
  ]
  const funFactsArticles = funFactsConfig
    .map((item) => findArticle(item.id, item.fallbacks))
    .filter(Boolean)

  // 2. Winning hearts articles (exact requested order)
  const winningHeartsConfig = [
    { id: 'story-hard-work' },
    { id: 'story-luck-hardwork' },
    { id: 'story-recipe-success' },
    { id: 'story-phani' },
    { id: 'story-champions' }
  ]
  const winningHeartsArticles = winningHeartsConfig
    .map((item) => findArticle(item.id, item.fallbacks))
    .filter(Boolean)

  return (
    <aside className="shoulder left" id="stories">
      <div className="rail-head rail-head-featured">Fun facts</div>
      {funFactsArticles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
        />
      ))}

      <div className="rail-head rail-head-featured" id="success-stories" style={{ marginTop: '24px' }}>
        Winning hearts
      </div>
      <div className="article-card-quote-box">
        <p>
          Every life at Swayamkrushi is a story of courage, growth, and achievement. Here are just a few of the journeys that inspire us every day.
        </p>
      </div>
      {winningHeartsArticles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
          quote={article.id === 'story-champions' ? '' : article.quote}
        />
      ))}

      {newsItems.length > 0 && (
        <div className="rail-wing-section" id="in-the-news">
          <Link to="/media-buzz" className="rail-head rail-head-featured rail-head-link">
            In the News
          </Link>
          {newsItems.map((item) => {
            const itemKey = item.id || item._id
            const videoUrl = item.video || item.articleUrl || ''
            const embedSrc = item.isVideo ? youtubeEmbed(videoUrl, playingNewsId === itemKey) : null
            const thumb =
              item.image ||
              item.imageUrl ||
              item.videoThumbnailUrl ||
              youtubeThumb(videoUrl) ||
              null
            const href = item.articleUrl || item.video || '/media-buzz'
            const isExternal = Boolean(href && /^https?:\/\//i.test(href))
            const blurb = typeof item.excerpt === 'string' ? item.excerpt.trim() : ''
            const isPlaying = playingNewsId === itemKey

            const body = (
              <div className="rail-news-body">
                {item.outlet ? <span className="rail-news-outlet">{item.outlet}</span> : null}
                <h4>{item.title}</h4>
                {blurb ? <p className="rail-news-excerpt">{blurb}</p> : null}
                {item.date ? <span className="rail-news-date">{item.date}</span> : null}
              </div>
            )

            if (item.isVideo && embedSrc) {
              return (
                <div
                  key={itemKey}
                  className="rail-news-card has-media is-video"
                  data-is-video="true"
                  data-media-type="video"
                >
                  <div className="rail-news-thumb no-preview">
                    {isPlaying ? (
                      <iframe
                        className="rail-news-embed"
                        src={embedSrc}
                        title={item.title || 'News video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        type="button"
                        className="rail-news-play-btn no-preview"
                        onClick={() => setPlayingNewsId(itemKey)}
                        aria-label={`Play video: ${item.title}`}
                      >
                        <img
                          src={thumb}
                          alt=""
                          loading="lazy"
                          className="no-preview video-thumb"
                          data-no-preview="true"
                        />
                        <span className="rail-news-play" aria-hidden="true">▶</span>
                      </button>
                    )}
                  </div>
                  {body}
                </div>
              )
            }

            const CardTag = isExternal ? 'a' : Link
            const cardProps = isExternal
              ? { href, target: '_blank', rel: 'noopener noreferrer' }
              : { to: href }

            return (
              <CardTag
                key={itemKey}
                {...cardProps}
                className={`rail-news-card${thumb ? ' has-media' : ''}`}
              >
                {thumb ? (
                  <div className="rail-news-thumb">
                    <img src={thumb} alt="" loading="lazy" />
                  </div>
                ) : null}
                {body}
              </CardTag>
            )
          })}
          <Link to="/media-buzz" className="rail-view-all">
            View all →
          </Link>
        </div>
      )}
    </aside>
  )
}
