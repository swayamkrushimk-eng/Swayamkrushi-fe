import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/images/logo.png'
import circleLeftImg from '../assets/images/circle-left.jpg'
import facilitatorImg from '../assets/images/circle-facilitator.jpg'
import circleRightImg from '../assets/images/circle-right.png'
import joinUsBadge from '../assets/images/join-us-badge.png'
import { fetchSettings } from '../services/api'

export default function Masthead() {
  const [heroImages, setHeroImages] = useState({
    left: circleLeftImg,
    center: facilitatorImg,
    right: circleRightImg,
    badge: joinUsBadge,
    leftPos: 'center 50%',
    centerPos: 'center 50%',
    rightPos: 'center 52%'
  })

  useEffect(() => {
    fetchSettings()
      .then((settings) => {
        if (settings) {
          setHeroImages({
            left: settings.circleLeftImage || circleLeftImg,
            center: settings.circleCenterImage || facilitatorImg,
            right: settings.circleRightImage || circleRightImg,
            badge: settings.joinUsBadgeImage || joinUsBadge,
            leftPos: settings.circleLeftPos || 'center 50%',
            centerPos: settings.circleCenterPos || 'center 50%',
            rightPos: settings.circleRightPos || 'center 52%'
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <main className="wrap" id="top">
      <div className="masthead-row">
        <div className="logo">
          <img src={logoImg} alt="Swayamkrushi logo" />
        </div>
        <div className="masthead-text">
          <h1 className="wordmark">
            Swayamkr<span className="ushi-part">ushi<small className="reg-sub">REG. NO. 3608/1991</small></span>
          </h1>
          <p className="strapline">Self reliance for persons with intellectual disabilities, since 1991</p>
        </div>
      </div>

      <div className="circles-wrap">
        <div className="circles">
          <div className="disc excluded">
            <img
              src={heroImages.left}
              alt="Children excluded from school and community life"
              style={{ objectPosition: heroImages.leftPos }}
              onError={(e) => { e.target.src = circleLeftImg }}
            />
          </div>

          <div className="facilitator">
            <img
              src={heroImages.center}
              alt="Manjulaa Kalyaan, founder of Swayamkrushi"
              style={{ objectPosition: heroImages.centerPos }}
              onError={(e) => { e.target.src = facilitatorImg }}
            />
          </div>

          <div className="disc included">
            <img
              src={heroImages.right}
              alt="Children learning and thriving together"
              style={{ objectPosition: heroImages.rightPos }}
              onError={(e) => { e.target.src = circleRightImg }}
            />
          </div>
        </div>

        <Link to="/donation" className="hero-side-badge" title="Join Us - Support Swayamkrushi" aria-label="Join Us - Support Swayamkrushi">
          <img
            src={heroImages.badge}
            alt="Join us at Swayamkrushi"
            onError={(e) => { e.target.src = joinUsBadge }}
          />
        </Link>
      </div>

      <p className="founder-line">
        She drew a circle that shut her out &mdash; we drew a circle that took her in
      </p>

      <div className="numbers-wrap">
        <div className="numbers">
          <div>
            <b>35+</b>
            <span>Years served</span>
          </div>
          <div>
            <b>250+</b>
            <span>Lives empowered</span>
          </div>
          <div>
            <b>5</b>
            <span>Group homes</span>
          </div>
          <div>
            <b>140+</b>
            <span>Student strength</span>
          </div>
          <div>
            <b>1000+</b>
            <span>SPL educators</span>
          </div>
        </div>
      </div>
    </main>
  )
}
