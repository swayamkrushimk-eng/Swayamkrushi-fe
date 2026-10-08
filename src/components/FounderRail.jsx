import { useState, useEffect } from 'react'
import manjulaPortrait from '../assets/images/manjula-portrait.png'
import workshopSvg from '../assets/images/workshop.svg'
import { rightSideArticles } from '../data/articlesData'
import { articleImagesMap } from '../data/allArticles'
import { fetchArticles } from '../services/api'
import ArticleCard from './ArticleCard'

export default function FounderRail() {
  const [articles, setArticles] = useState(rightSideArticles)

  useEffect(() => {
    fetchArticles({ section: 'right' }).then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setArticles(data)
      }
    })
  }, [])

  const existingStory = articles[0] || rightSideArticles[0]
  const newRightArticles = articles.slice(1)

  return (
    <aside className="shoulder right">
      <div className="rail-head">Manjula's Musings</div>
      <div className="rail-item founder-card">
        <img className="founder-img" src={manjulaPortrait} alt="Ms Manjula Kalyan" />
        <h4>Ms Manjula Kalyan</h4>
        <p>Founder and director.</p>
      </div>

      <ArticleCard
        key={existingStory.id}
        {...existingStory}
      />

      <div className="rail-head">Watch</div>
      <a className="rail-item" href="#programs">
        <img src={workshopSvg} alt="A vocational workshop in progress" />
        <h4>Inside the workshop</h4>
        <p>Two minutes on the vocational floor, where the two-year course is taught.</p>
      </a>

      <div className="rail-head" style={{ marginTop: '16px' }}>More Stories</div>
      {newRightArticles.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
        />
      ))}
    </aside>
  )
}
