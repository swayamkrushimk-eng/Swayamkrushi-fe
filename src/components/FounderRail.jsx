import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import manjulaPortrait from '../assets/images/manjula-portrait.jpeg'
import { rightSideArticles } from '../data/articlesData'
import { allArticles } from '../data/allArticles'
import { fetchArticles, fetchEventImages, isIdDeleted } from '../services/api'
import { isVideoUrl, getVideoThumbnailUrl } from '../utils/mediaUtils'
import ArticleCard from './ArticleCard'

function mediaSrc(item) {
  return item?.url || item?.imageUrl || item?.image || item?.src || item?.videoUrl || ''
}

function collectPixeriaImages(albums, limit = 9) {
  if (!Array.isArray(albums)) return []
  const out = []

  for (const album of albums) {
    const title = album?.title || 'Event'
    const files =
      Array.isArray(album?.media) && album.media.length
        ? album.media
        : mediaSrc(album)
          ? [album]
          : []

    for (const file of files) {
      const src = mediaSrc(file)
      if (!src) continue
      const video = file?.mediaType === 'video' || isVideoUrl(src)
      const thumb = video
        ? (file?.videoThumbnailUrl || getVideoThumbnailUrl(src) || '')
        : src
      if (!thumb) continue
      out.push({
        key: `${album?._id || album?.id || title}-${src}`,
        src: thumb,
        title,
        isVideo: video
      })
      if (out.length >= limit) return out
    }
  }

  return out
}

export default function FounderRail() {
  const [apiArticles, setApiArticles] = useState([])
  const [pixeriaImages, setPixeriaImages] = useState([])

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
    fetchEventImages()
      .then((data) => {
        if (!cancelled) setPixeriaImages(collectPixeriaImages(data, 9))
      })
      .catch(() => {
        if (!cancelled) setPixeriaImages([])
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
      const fromRight = rightSideArticles.find((a) => a.id === testId)
      if (fromRight) return fromRight
      const fromAll = allArticles.find((a) => a.id === testId)
      if (fromAll) return fromAll
    }
    return null
  }

  // 1. Manjula's Musings
  const musingIds = [
    'story-encounter',
    'story-group-homes-initiative',
    'story-durga',
    'story-womens-empowerment'
  ]
  const musingArticles = musingIds
    .map((id) => findArticle(id))
    .filter(Boolean)

  // 2. Activities galore (9 articles in exact requested order)
  const activitiesConfig = [
    { id: 'story-fifteen-years', fallbacks: ['story-15-years'] },
    { id: 'story-art-equaliser' },
    { id: 'story-nios' },
    { id: 'story-paper-bag' },
    { id: 'story-exercise' },
    { id: 'story-therapy-body-soul-mind' },
    { id: 'story-sowing-seeds', fallbacks: ['story-tailoring'] },
    { id: 'story-kitchen' },
    { id: 'story-covid' }
  ]
  const activitiesArticles = activitiesConfig
    .map((item) => findArticle(item.id, item.fallbacks))
    .filter(Boolean)

  return (
    <aside className="shoulder right">
      <div className="rail-head rail-head-featured" id="manjula-musings">Manjula's Musings</div>
      <div className="rail-item founder-card">
        <img className="founder-img" src={manjulaPortrait} alt="Manjulaa Kalyaan" />
      </div>

      {musingArticles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
        />
      ))}

      <div className="rail-head rail-head-featured" id="activities-galore" style={{ marginTop: '24px' }}>Activities galore</div>
      {activitiesArticles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
        />
      ))}

      {pixeriaImages.length > 0 && (
        <div className="rail-wing-section" id="pixeria">
          <Link to="/events" className="rail-head rail-head-featured rail-head-link">
            Pixeria
          </Link>
          <div className="rail-pixeria-grid">
            {pixeriaImages.map((img) => (
              <Link
                key={img.key}
                to="/events"
                className="rail-pixeria-cell"
                title={img.title}
              >
                <img src={img.src} alt={img.title} loading="lazy" />
                {img.isVideo ? <span className="rail-pixeria-play" aria-hidden="true">▶</span> : null}
              </Link>
            ))}
          </div>
          <Link to="/events" className="rail-view-all">
            View all →
          </Link>
        </div>
      )}
    </aside>
  )
}
