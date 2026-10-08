import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import birthdayImg from '../assets/images/birthday-courtyard.jpg'
import grouphomeResidentsImg from '../assets/images/grouphome-residents.jpg'
import nationalTrustImg from '../assets/images/national-trust-event.jpg'
import {
  homeOfCareArticle,
  groupHomesArticle,
  bedHotspotArticle,
  mainArticle
} from '../data/articlesData'
import { fetchArticles } from '../services/api'
import VideoPlayer from './VideoPlayer'
import { resolveArticleMedia } from '../utils/mediaUtils'
import buildingBlocksSvg from '../assets/images/mocks/building-blocks.svg'

const isValidVideo = (art) => {
  return Boolean(
    art &&
    (art.mediaType === 'video' || (typeof art.videoUrl === 'string' && art.videoUrl.trim().length > 5 && art.mediaType !== 'image')) &&
    typeof art.videoUrl === 'string' &&
    art.videoUrl.trim().length > 5
  )
}

export default function MainContent() {
  const [mainArts, setMainArts] = useState({})

  useEffect(() => {
    fetchArticles({ section: 'main' }).then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped = {}
        data.forEach((a) => {
          mapped[a.id] = a
        })
        setMainArts(mapped)
      }
    })
  }, [])

  const homeOfCare = mainArts['home-of-care'] || homeOfCareArticle
  const groupHomes = mainArts['group-homes'] || groupHomesArticle
  const bedHotspot = mainArts['bed-hotspot'] || bedHotspotArticle
  const buildingBlocks = mainArts['building-blocks'] || mainArticle

  const homeOfCareMedia = resolveArticleMedia(homeOfCare, birthdayImg)
  const groupHomesMedia = resolveArticleMedia(groupHomes, grouphomeResidentsImg)
  const bedHotspotMedia = resolveArticleMedia(bedHotspot, nationalTrustImg)
  const buildingBlocksMedia = resolveArticleMedia(buildingBlocks, buildingBlocksSvg)

  return (
    <main className="body-col">
      {/* 1. First Main Article: A home of care, growth and hope */}
      <section id="about">
        <h2>{homeOfCare.title}</h2>
        <p className="lede">
          {homeOfCare.excerpt}
        </p>

        {!homeOfCareMedia.isText && (
          <figure>
            {homeOfCareMedia.isVideo && homeOfCareMedia.videoUrl ? (
              <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                <VideoPlayer
                  src={homeOfCareMedia.deliveryVideoUrl || homeOfCareMedia.videoUrl}
                  poster={homeOfCareMedia.posterUrl || birthdayImg}
                  title={homeOfCare.title}
                  category={homeOfCare.category || 'Featured Story'}
                  aspectRatio="21/9"
                  autoPlay={false}
                />
              </div>
            ) : homeOfCareMedia.posterUrl ? (
              <img
                src={homeOfCareMedia.posterUrl}
                alt="Staff and residents around a birthday cake at Swayamkrushi"
                onError={(e) => { e.target.src = birthdayImg }}
              />
            ) : null}
            <figcaption>
              A birthday marked in the courtyard &mdash; an ordinary afternoon at Swayamkrushi.
            </figcaption>
          </figure>
        )}

        <p>{homeOfCare.paragraphs[0]}</p>
        <p>{homeOfCare.paragraphs[1]}</p>

        <p className="main-read-more-wrap">
          <Link to="/article/home-of-care" className="main-read-more-btn">
            Read full story &rarr;
          </Link>
        </p>

        {/* 2. Second Feature: Group Homes */}
        <h2 className="story-head">{groupHomes.title}</h2>
        {!groupHomesMedia.isText && (
          <figure>
            {groupHomesMedia.isVideo && groupHomesMedia.videoUrl ? (
              <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                <VideoPlayer
                  src={groupHomesMedia.deliveryVideoUrl || groupHomesMedia.videoUrl}
                  poster={groupHomesMedia.posterUrl || grouphomeResidentsImg}
                  title={groupHomes.title}
                  category={groupHomes.category || 'Group Homes'}
                  aspectRatio="21/9"
                  autoPlay={false}
                />
              </div>
            ) : groupHomesMedia.posterUrl ? (
              <img
                src={groupHomesMedia.posterUrl}
                alt="Residents outside one of the group homes"
                onError={(e) => { e.target.src = grouphomeResidentsImg }}
              />
            ) : null}
            <figcaption>
              Residents outside their home &mdash; the group homes have run since 1991.
            </figcaption>
          </figure>
        )}

        <p>{groupHomes.paragraphs[0]}</p>
        <p>{groupHomes.paragraphs[1]}</p>

        <p className="main-read-more-wrap">
          <Link to="/article/group-homes" className="main-read-more-btn">
            Read full story &rarr;
          </Link>
        </p>

        {/* 3. Third Feature: The B.Ed Hotspot */}
        <h2 className="story-head">{bedHotspot.title}</h2>
        {!bedHotspotMedia.isText && (
          <figure>
            {bedHotspotMedia.isVideo && bedHotspotMedia.videoUrl ? (
              <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                <VideoPlayer
                  src={bedHotspotMedia.deliveryVideoUrl || bedHotspotMedia.videoUrl}
                  poster={bedHotspotMedia.posterUrl || nationalTrustImg}
                  title={bedHotspot.title}
                  category={bedHotspot.category || 'Special Education'}
                  aspectRatio="21/9"
                  autoPlay={false}
                />
              </div>
            ) : bedHotspotMedia.posterUrl ? (
              <img
                src={bedHotspotMedia.posterUrl}
                alt="Swayamkrushi staff, students and residents at a National Trust event"
                onError={(e) => { e.target.src = nationalTrustImg }}
              />
            ) : null}
            <figcaption>
              Staff, students and residents together at a National Trust event.
            </figcaption>
          </figure>
        )}

        <p>{bedHotspot.paragraphs[0]}</p>
        <p>{bedHotspot.paragraphs[1]}</p>

        <p className="main-read-more-wrap">
          <Link to="/article/bed-hotspot" className="main-read-more-btn">
            Read full story &rarr;
          </Link>
        </p>

        {/* Mission & Vision Callout */}
        <div className="split">
          <div>
            <h4>Mission</h4>
            <p>
              To house and train persons with intellectual disability before facilitating their employment
              and independent living within the community.
            </p>
          </div>
          <div>
            <h4>Vision</h4>
            <p>
              A society in which the less fortunate live with dignity, pride and as productive members of
              that society.
            </p>
          </div>
        </div>

        <blockquote>
          Every child deserves to live their best life.
          <cite>Ms Manjula Kalyan, founder</cite>
        </blockquote>
      </section>

      {/* 4. Fourth Feature: A Game of Building Blocks */}
      <section id="building-blocks">
        <h2>{buildingBlocks.title}</h2>
        <p className="lede">
          {buildingBlocks.paragraphs[0]}
        </p>
        {!buildingBlocksMedia.isText && (
          <figure>
            {buildingBlocksMedia.isVideo && buildingBlocksMedia.videoUrl ? (
              <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                <VideoPlayer
                  src={buildingBlocksMedia.deliveryVideoUrl || buildingBlocksMedia.videoUrl}
                  poster={buildingBlocksMedia.posterUrl || buildingBlocksSvg}
                  title={buildingBlocks.title}
                  category={buildingBlocks.category || 'Campus History'}
                  aspectRatio="21/9"
                  autoPlay={false}
                />
              </div>
            ) : buildingBlocksMedia.posterUrl ? (
              <img
                src={buildingBlocksMedia.posterUrl}
                alt="A Game of Building Blocks - Swayamkrushi campus"
                onError={(e) => { e.target.src = buildingBlocksSvg }}
              />
            ) : null}
            <figcaption>Building blocks of a dream &mdash; from a four-bedroom house in 1991 to a five-acre campus today.</figcaption>
          </figure>
        )}
        <p>{buildingBlocks.paragraphs[1]}</p>

        <p className="main-read-more-wrap">
          <Link to="/article/building-blocks" className="main-read-more-btn">
            Read full story &rarr;
          </Link>
        </p>
      </section>



      {/* Give Section */}
      <section className="give" id="give">
        <h2>Give</h2>
        <p>Every contribution, whatever its size, helps us bring one more person into the circle.</p>
        <div className="row">
          <a className="solid" href="#contact">Join our family</a>
          <a className="hollow" href="#contact">Other ways to give</a>
          <a className="hollow" href="#contact">Volunteer with us</a>
        </div>
      </section>
    </main>
  )
}
