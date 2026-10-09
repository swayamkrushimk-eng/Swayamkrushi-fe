import { useState, useEffect } from 'react'
import manjulaPortrait from '../assets/images/manjula-portrait.jpeg'
import { rightSideArticles } from '../data/articlesData'
import { allArticles } from '../data/allArticles'
import { fetchArticles } from '../services/api'
import ArticleCard from './ArticleCard'

export default function FounderRail() {
  const [apiArticles, setApiArticles] = useState([])

  useEffect(() => {
    fetchArticles().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setApiArticles(data)
      }
    })
  }, [])

  const findArticle = (id, fallbackIds = []) => {
    const ids = [id, ...fallbackIds]
    for (const testId of ids) {
      const fromApi = apiArticles.find((a) => a.id === testId)
      if (fromApi) return fromApi
      const fromRight = rightSideArticles.find((a) => a.id === testId)
      if (fromRight) return fromRight
      const fromAll = allArticles.find((a) => a.id === testId)
      if (fromAll) return fromAll
    }
    return null
  }

  // 1. Manjula's Musings (3 articles)
  const musingIds = [
    'story-encounter',
    'story-group-homes-initiative',
    'story-womens-empowerment'
  ]
  const musingArticles = musingIds
    .map((id) => findArticle(id))
    .filter(Boolean)

  // 2. Activities galore (8 articles in exact requested order)
  const activitiesConfig = [
    { id: 'story-fifteen-years', fallbacks: ['story-15-years'] },
    { id: 'story-art-equaliser' },
    { id: 'story-nios' },
    { id: 'story-paper-bag' },
    { id: 'story-exercise' },
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
        <h4>Manjulaa Kalyaan</h4>
        <p>Founder and director.</p>
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
    </aside>
  )
}
