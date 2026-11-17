import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import birthdayImg from '../assets/images/birthday-courtyard.jpg'
import grouphomeResidentsImg from '../assets/images/grouphome-residents.jpg'
import nationalTrustImg from '../assets/images/national-trust-event.jpg'
import {
  gloriousYearsArticle,
  homeOfCareArticle,
  groupHomesArticle,
  bedHotspotArticle,
  mainArticle
} from '../data/articlesData'
import { fetchArticles, isIdDeleted } from '../services/api'
import VideoPlayer from './VideoPlayer'
import CaptionText from './CaptionText'
import ArticleAudioPlayer from './ArticleAudioPlayer'
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
    fetchArticles({ section: 'main', forceFresh: true }).then(loadMain)

    const onUpdate = (e) => {
      if (e.detail?.key === 'section_main' && Array.isArray(e.detail.data)) {
        loadMain(e.detail.data)
      }
    }
    window.addEventListener('swayamkrushi_articles_updated', onUpdate)
    return () => window.removeEventListener('swayamkrushi_articles_updated', onUpdate)
  }, [])

  const gloriousYears = isIdDeleted('article', '35-glorious-years')
    ? null
    : (mainArts['35-glorious-years'] || (gloriousYearsArticle?.id ? gloriousYearsArticle : null))
  const homeOfCare = isIdDeleted('article', 'home-of-care') ? null : (mainArts['home-of-care'] || null)
  const groupHomes = isIdDeleted('article', 'group-homes') ? null : (mainArts['group-homes'] || null)
  const bedHotspot = isIdDeleted('article', 'bed-hotspot') ? null : (mainArts['bed-hotspot'] || null)
  const buildingBlocks = isIdDeleted('article', 'building-blocks') ? null : (mainArts['building-blocks'] || null)

  // Homepage/outside: play the glory story video even when the article hero is an image
  const gloriousYearsMedia = gloriousYears
    ? resolveArticleMedia(
        gloriousYears.videoUrl
          ? { ...gloriousYears, featuredMediaType: 'video', mediaType: 'video' }
          : gloriousYears,
        null
      )
    : {}
  const gloriousYearsVideoCaption = (() => {
    if (!gloriousYears) return ''
    const fromImages = Array.isArray(gloriousYears.images)
      ? gloriousYears.images.find((img) => {
          const url = typeof img === 'string' ? img : img?.url
          const type = typeof img === 'object' ? img.type : ''
          return (
            (type === 'video' || (url && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url))) &&
            (img.caption || img.alt)
          )
        })
      : null
    return (
      (fromImages && (fromImages.caption || fromImages.alt)) ||
      'INSPIRING : Former Vice President M Venkaiah Naidu, despite being indisposed, spoke passionately about the cause in virtual mode'
    )
  })()
  const homeOfCareMedia = homeOfCare ? resolveArticleMedia(homeOfCare, birthdayImg) : {}
  // Homepage teaser for Group Homes: always the in-article still, never the featured video.
  const groupHomesHomeStill = (() => {
    const INDEPENDENT_LIVING_CAPTION =
      'INDEPENDENT LIVING : Group Home residents pose for a picture at a function in the Swayamkrushi campus'
    if (!groupHomes) return { url: grouphomeResidentsImg, caption: INDEPENDENT_LIVING_CAPTION }
    const stills = Array.isArray(groupHomes.images)
      ? groupHomes.images.filter((img) => {
          const url = typeof img === 'string' ? img : img?.url
          const type = typeof img === 'object' ? img.type : ''
          return url && type !== 'video' && !/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
        })
      : []
    const preferred =
      stills.find((img) => {
        const url = typeof img === 'string' ? img : img?.url
        const cap = typeof img === 'object' ? (img.caption || img.alt || '') : ''
        return /grouphome-residents/i.test(url || '') || /INDEPENDENT LIVING/i.test(cap)
      }) || stills[0]
    const url =
      (typeof preferred === 'object' ? preferred?.url : preferred) ||
      (groupHomes.imageUrl && !/\.(mp4|webm|mov|m4v)(\?|$)/i.test(groupHomes.imageUrl)
        ? groupHomes.imageUrl
        : null) ||
      grouphomeResidentsImg
    const caption =
      (typeof preferred === 'object' && (preferred.caption || preferred.alt)) ||
      INDEPENDENT_LIVING_CAPTION
    return { url, caption }
  })()
  const bedHotspotMedia = bedHotspot ? resolveArticleMedia(bedHotspot, null) : {}
  const buildingBlocksMedia = buildingBlocks ? resolveArticleMedia(buildingBlocks, buildingBlocksSvg) : {}

  return (
    <main className="body-col" style={Object.keys(mainArts).length === 0 ? { minHeight: '500px' } : undefined}>
      {/* 0. Coral Jubilee Feature: 35 years of glory! */}
      {gloriousYears && (
        <section id="35-glorious-years">
          <div className="story-title-with-mic">
            <h2>{gloriousYears.title}</h2>
            <ArticleAudioPlayer article={gloriousYears} compact />
          </div>
          <p className="lede">
            {(gloriousYears.paragraphs && gloriousYears.paragraphs[0]) || gloriousYears.excerpt}
          </p>
          {!gloriousYearsMedia.isText && (
            <figure data-is-video={gloriousYearsMedia.isVideo ? 'true' : undefined}>
              {gloriousYearsMedia.isVideo && gloriousYearsMedia.videoUrl ? (
                <div className="main-story-video-container">
                  <div className="article-video-player-container" style={{ margin: 0 }}>
                    <VideoPlayer
                      src={gloriousYearsMedia.deliveryVideoUrl || gloriousYearsMedia.videoUrl}
                      poster={gloriousYearsMedia.posterUrl || undefined}
                      title={gloriousYears.title}
                      category={gloriousYears.category || 'Stories & Milestones'}
                      aspectRatio="16/9"
                      autoPlay={false}
                    />
                  </div>
                </div>
              ) : gloriousYearsMedia.posterUrl ? (
                <img
                  src={gloriousYearsMedia.posterUrl}
                  alt={gloriousYears.imageAlt || gloriousYears.title || ''}
                  onError={(e) => {
                    if (gloriousYears.imageUrl) e.target.src = gloriousYears.imageUrl
                  }}
                />
              ) : null}
              {(gloriousYearsMedia.isVideo ? gloriousYearsVideoCaption : gloriousYears.imageAlt) ? (
                <figcaption className="main-story-video-caption">
                  <CaptionText caption={gloriousYearsMedia.isVideo ? gloriousYearsVideoCaption : gloriousYears.imageAlt} />
                </figcaption>
              ) : null}
            </figure>
          )}
          {gloriousYears.paragraphs?.[1] && <p>{gloriousYears.paragraphs[1]}</p>}

          <p className="main-read-more-wrap">
            <Link to="/article/35-glorious-years" className="main-read-more-btn">
              Read full story &rarr;
            </Link>
          </p>
          <p className="main-read-more-wrap main-also-see">
            <span className="main-also-see-label">Also see</span>
            <Link to="/media-buzz" className="main-read-more-btn">
              Media buzz &rarr;
            </Link>
            <span className="main-also-see-amp">&amp;</span>
            <Link to="/events" className="main-read-more-btn">
              Events gallery &rarr;
            </Link>
          </p>
        </section>
      )}

      {/* 1. Top Feature: Blood, Sweat and Tears / Building Blocks */}
      {buildingBlocks && (
        <section id="building-blocks">
        <div className="story-title-with-mic">
          <h2>{buildingBlocks.title}</h2>
          <ArticleAudioPlayer article={buildingBlocks} compact />
        </div>
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
                alt={buildingBlocks.imageAlt || buildingBlocks.title || ''}
                onError={(e) => {
                  if (buildingBlocks.imageUrl) e.target.src = buildingBlocks.imageUrl
                  else e.target.src = buildingBlocksSvg
                }}
              />
            ) : null}
            {buildingBlocks.imageAlt ? (
              <figcaption className="main-story-video-caption">
                <CaptionText caption={buildingBlocks.imageAlt} />
              </figcaption>
            ) : null}
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
        <section id="about" className="center-about">
          {homeOfCare && (
            <div className="center-story">
              <div className="story-title-with-mic">
                <h2>{homeOfCare.title}</h2>
                <ArticleAudioPlayer article={homeOfCare} compact />
              </div>
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
                      <figcaption className="main-story-video-caption">
                        <CaptionText caption={cap} />
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
            </div>
          )}

          {/* 3. Second Feature: Group Homes */}
          {groupHomes && (
            <div className="center-story">
              <div className="story-title-with-mic">
                <h2 className="story-head">{groupHomes.title}</h2>
                <ArticleAudioPlayer article={groupHomes} compact />
              </div>
              {groupHomesHomeStill.url && (
                <figure>
                  <img
                    src={groupHomesHomeStill.url}
                    alt={groupHomesHomeStill.caption || 'Residents outside one of the group homes'}
                    onError={(e) => { e.target.src = grouphomeResidentsImg }}
                  />
                  {groupHomesHomeStill.caption ? (
                    <figcaption className="main-story-video-caption">
                      <CaptionText caption={groupHomesHomeStill.caption} />
                    </figcaption>
                  ) : null}
                </figure>
              )}

              <p className="lede">{groupHomes.paragraphs[0]}</p>
              <p>{groupHomes.paragraphs[1]}</p>

              <p className="main-read-more-wrap">
                <Link to="/article/group-homes" className="main-read-more-btn">
                  Read full story &rarr;
                </Link>
              </p>
            </div>
          )}

          {/* 4. Third Feature: The B.Ed Hotspot */}
          {bedHotspot && (
            <div className="center-story center-last-story">
              <div className="story-title-with-mic">
                <h2 className="story-head">{bedHotspot.title}</h2>
                <ArticleAudioPlayer article={bedHotspot} compact />
              </div>
              {!bedHotspotMedia.isText && (
                <figure data-is-video={bedHotspotMedia.isVideo ? 'true' : undefined}>
                  {bedHotspotMedia.isVideo && bedHotspotMedia.videoUrl ? (
                    <div className="article-video-player-container" style={{ margin: 0 }}>
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
                      : 'GETTING READY : A B.Ed (Spl Education in ID) in progress at the Swayamkrushi College'
                    return cap ? (
                      <figcaption className="main-story-video-caption">
                        <CaptionText caption={cap} />
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
            </div>
          )}
        </section>
      )}
    </main>
  )
}
