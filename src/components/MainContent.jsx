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
import { fetchArticles, isIdDeleted } from '../services/api'
import VideoPlayer from './VideoPlayer'
import { resolveArticleMedia } from '../utils/mediaUtils'
import buildingBlocksSvg from '../assets/images/mocks/building-blocks.svg'

export default function MainContent() {
  const [mainArts, setMainArts] = useState({})

  useEffect(() => {
    const loadMain = (data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped = {}
        data.forEach((a) => {
          mapped[a.id] = a
        })
        setMainArts(mapped)
      }
    }
    fetchArticles({ section: 'main' }).then(loadMain)

    const onUpdate = (e) => {
      if (e.detail?.key === 'section_main' && Array.isArray(e.detail.data)) {
        loadMain(e.detail.data)
      }
    }
    window.addEventListener('swayamkrushi_articles_updated', onUpdate)
    return () => window.removeEventListener('swayamkrushi_articles_updated', onUpdate)
  }, [])

  const homeOfCare = isIdDeleted('article', 'home-of-care') ? null : (mainArts['home-of-care'] || null)
  const groupHomes = isIdDeleted('article', 'group-homes') ? null : (mainArts['group-homes'] || null)
  const bedHotspot = isIdDeleted('article', 'bed-hotspot') ? null : (mainArts['bed-hotspot'] || null)
  const buildingBlocks = isIdDeleted('article', 'building-blocks') ? null : (mainArts['building-blocks'] || null)

  const homeOfCareMedia = homeOfCare ? resolveArticleMedia(homeOfCare, birthdayImg) : {}
  const groupHomesMedia = groupHomes ? resolveArticleMedia(groupHomes, grouphomeResidentsImg) : {}
  const bedHotspotMedia = bedHotspot ? resolveArticleMedia(bedHotspot, null) : {}
  const buildingBlocksMedia = buildingBlocks ? resolveArticleMedia(buildingBlocks, buildingBlocksSvg) : {}

  return (
    <main className="body-col" style={Object.keys(mainArts).length === 0 ? { minHeight: '500px' } : undefined}>
      {/* 1. Top Feature: A Game of Building Blocks */}
      {buildingBlocks && (
        <section id="building-blocks">
        <h2>{buildingBlocks.title}</h2>
        <p className="lede">
          {buildingBlocks.paragraphs[0]}
        </p>
        {!buildingBlocksMedia.isText && (
          <figure
            className={buildingBlocksMedia.isVideo ? 'main-story-video-container' : ''}
            data-is-video={buildingBlocksMedia.isVideo ? 'true' : undefined}
          >
            {buildingBlocksMedia.isVideo && buildingBlocksMedia.videoUrl ? (
              <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                <VideoPlayer
                  src={buildingBlocksMedia.deliveryVideoUrl || buildingBlocksMedia.videoUrl}
                  poster={buildingBlocksMedia.posterUrl || buildingBlocksSvg}
                  title={buildingBlocks.title}
                  category={buildingBlocks.category || 'Campus History'}
                  aspectRatio="16/9"
                  autoPlay={false}
                />
              </div>
            ) : buildingBlocksMedia.posterUrl ? (
              <img
                src={buildingBlocksMedia.posterUrl}
                alt="CLASS IN PROGRESS : Chavan, spl educator, explains different concepts to his students"
                onError={(e) => { e.target.src = buildingBlocksSvg }}
              />
            ) : null}
            {(() => {
              const cap = buildingBlocks.imageAlt !== undefined
                ? (buildingBlocks.imageAlt === 'A Game of Building Blocks' || buildingBlocks.imageAlt === 'Building blocks of a dream' ? 'CLASS IN PROGRESS : Chavan, spl educator, explains different concepts to his students' : buildingBlocks.imageAlt)
                : 'CLASS IN PROGRESS : Chavan, spl educator, explains different concepts to his students'
              return cap ? (
                <figcaption style={{ fontStyle: 'italic', color: '#000000' }}>
                  {cap}
                </figcaption>
              ) : null
            })()}
          </figure>
        )}
        <p>{buildingBlocks.paragraphs[1]}</p>

        <p className="main-read-more-wrap">
          <Link to="/article/building-blocks" className="main-read-more-btn">
            Read full story &rarr;
          </Link>
        </p>
      </section>
      )}

      {/* 2. Main Article & Secondary Features */}
      {(homeOfCare || groupHomes || bedHotspot) && (
        <section id="about">
          {homeOfCare && (
            <>
              <h2>{homeOfCare.title}</h2>
              <p className="lede">
                {homeOfCare.excerpt}
              </p>

              {!homeOfCareMedia.isText && (
                <figure
                  className={homeOfCareMedia.isVideo ? 'main-story-video-container' : ''}
                  data-is-video={homeOfCareMedia.isVideo ? 'true' : undefined}
                >
                  {homeOfCareMedia.isVideo && homeOfCareMedia.videoUrl ? (
                    <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                      <VideoPlayer
                        src={homeOfCareMedia.deliveryVideoUrl || homeOfCareMedia.videoUrl}
                        poster={homeOfCareMedia.posterUrl || birthdayImg}
                        title={homeOfCare.title}
                        category={homeOfCare.category || 'Featured Story'}
                        aspectRatio="16/9"
                        autoPlay={false}
                      />
                    </div>
                  ) : homeOfCareMedia.posterUrl ? (
                    <img
                      src={homeOfCareMedia.posterUrl}
                      alt="FUN AND FROLIC : A video collage of activities In Swayamkrushi"
                      onError={(e) => { e.target.src = birthdayImg }}
                      className={homeOfCareMedia.isVideo ? 'no-preview video-thumb' : ''}
                      data-no-preview={homeOfCareMedia.isVideo ? 'true' : undefined}
                    />
                  ) : null}
                  {(() => {
                    const cap = homeOfCare.imageAlt !== undefined
                      ? (homeOfCare.imageAlt === 'A Home of Care, Growth and Hope' || homeOfCare.imageAlt === 'A home of care, growth and hope' ? 'FUN AND FROLIC : A video collage of activities In Swayamkrushi' : homeOfCare.imageAlt)
                      : 'FUN AND FROLIC : A video collage of activities In Swayamkrushi'
                    return cap ? (
                      <figcaption style={{ fontStyle: 'italic', color: '#000000' }}>
                        {cap}
                      </figcaption>
                    ) : null
                  })()}
                </figure>
              )}

              <p className="lede">{homeOfCare.paragraphs[0]}</p>
              <p>{homeOfCare.paragraphs[1]}</p>

              <p className="main-read-more-wrap">
                <Link to="/article/home-of-care" className="main-read-more-btn">
                  Read full story &rarr;
                </Link>
              </p>
            </>
          )}

          {/* 3. Second Feature: Group Homes */}
          {groupHomes && (
            <>
              <h2 className="story-head">{groupHomes.title}</h2>
              {!groupHomesMedia.isText && (
                <figure
                  className={groupHomesMedia.isVideo ? 'main-story-video-container' : ''}
                  data-is-video={groupHomesMedia.isVideo ? 'true' : undefined}
                >
                  {groupHomesMedia.isVideo && groupHomesMedia.videoUrl ? (
                    <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                      <VideoPlayer
                        src={groupHomesMedia.deliveryVideoUrl || groupHomesMedia.videoUrl}
                        poster={groupHomesMedia.posterUrl || grouphomeResidentsImg}
                        title={groupHomes.title}
                        category={groupHomes.category || 'Group Homes'}
                        aspectRatio="16/9"
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
                  {(() => {
                    const cap = groupHomes.imageAlt !== undefined
                      ? groupHomes.imageAlt
                      : 'Residents outside their home — the group homes have run since 1991.'
                    return cap ? (
                      <figcaption style={{ fontStyle: 'italic', color: '#000000' }}>
                        {cap}
                      </figcaption>
                    ) : null
                  })()}
                </figure>
              )}

              <p className="lede">{groupHomes.paragraphs[0]}</p>
              <p>{groupHomes.paragraphs[1]}</p>

              <p className="main-read-more-wrap">
                <Link to="/article/group-homes" className="main-read-more-btn">
                  Read full story &rarr;
                </Link>
              </p>
            </>
          )}

          {/* 4. Third Feature: The B.Ed Hotspot */}
          {bedHotspot && (
            <>
              <h2 className="story-head">{bedHotspot.title}</h2>
              {!bedHotspotMedia.isText && (
                <figure
                  className={bedHotspotMedia.isVideo ? 'main-story-video-container' : ''}
                  data-is-video={bedHotspotMedia.isVideo ? 'true' : undefined}
                >
                  {bedHotspotMedia.isVideo && bedHotspotMedia.videoUrl ? (
                    <div className="article-video-player-container" style={{ margin: '0 0 12px 0' }}>
                      <VideoPlayer
                        src={bedHotspotMedia.deliveryVideoUrl || bedHotspotMedia.videoUrl}
                        poster={bedHotspotMedia.posterUrl || nationalTrustImg}
                        title={bedHotspot.title}
                        category={bedHotspot.category || 'Special Education'}
                        aspectRatio="16/9"
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
                  {(() => {
                    const cap = bedHotspot.imageAlt !== undefined
                      ? bedHotspot.imageAlt
                      : 'Staff, students and residents together at a National Trust event.'
                    return cap ? (
                      <figcaption style={{ fontStyle: 'italic', color: '#000000' }}>
                        {cap}
                      </figcaption>
                    ) : null
                  })()}
                </figure>
              )}

              <p className="lede">{bedHotspot.paragraphs[0]}</p>
              <p>{bedHotspot.paragraphs[1]}</p>

              <p className="main-read-more-wrap">
                <Link to="/article/bed-hotspot" className="main-read-more-btn">
                  Read full story &rarr;
                </Link>
              </p>
            </>
          )}
        </section>
      )}
    </main>
  )
}
