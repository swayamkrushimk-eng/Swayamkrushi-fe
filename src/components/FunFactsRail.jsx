import { useState, useEffect } from 'react'
import { leftSideArticles, rightSideArticles } from '../data/articlesData'
import { allArticles } from '../data/allArticles'
import { fetchArticles } from '../services/api'
import ArticleCard from './ArticleCard'

export default function FunFactsRail() {
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

  // 2. Winning hearts articles (4 items in exact requested order)
  const winningHeartsConfig = [
    { id: 'story-hard-work' },
    { id: 'story-luck-hardwork' },
    { id: 'story-recipe-success' },
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
      {winningHeartsArticles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
        />
      ))}
    </aside>
  )
}

