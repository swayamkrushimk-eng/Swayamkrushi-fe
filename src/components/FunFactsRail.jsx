import { useState, useEffect } from 'react'
import { leftSideArticles } from '../data/articlesData'
import { articleImagesMap } from '../data/allArticles'
import { fetchArticles } from '../services/api'
import ArticleCard from './ArticleCard'

export default function FunFactsRail() {
  const filterFunFacts = (list) => {
    if (!Array.isArray(list)) return []
    return list.filter(
      (a) =>
        a.id !== 'story-encounter' &&
        a.id !== 'story-direct-speak' &&
        !a.title?.toLowerCase().includes('chance encounter') &&
        !a.title?.toLowerCase().includes('direct speak')
    )
  }

  const [articles, setArticles] = useState(() => filterFunFacts(leftSideArticles))

  useEffect(() => {
    fetchArticles({ section: 'left' }).then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setArticles(filterFunFacts(data))
      }
    })
  }, [])

  return (
    <aside className="shoulder left" id="stories">
      <div className="rail-head">Fun facts</div>

      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
        />
      ))}
    </aside>
  )
}

