import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Masthead from '../components/Masthead'
import FunFactsRail from '../components/FunFactsRail'
import MainContent from '../components/MainContent'
import FounderRail from '../components/FounderRail'
import PageLoader from '../components/PageLoader'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Dismiss loader smoothly once initial assets and layout are prepared
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setLoading(false), 450)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {loading && <PageLoader fadeOut={fadeOut} />}
      <SEO
        title="Swayamkrushi | Self Reliance for Persons with Intellectual Disabilities"
        description="Swayamkrushi (Reg. No. 3608/1991) is a premier non-profit organization in Secunderabad, Telangana offering pioneering group homes, residential care, special education, speech & physiotherapy, and recognized B.Ed Special Education."
        keywords="Swayamkrushi, NGO Hyderabad, special education Secunderabad, intellectual disability residential care, group homes Telangana, vocational training special needs, Manjulaa Kalyaan, NGO India"
        canonicalUrl="https://swayamkrushi.org/"
      />
      <Masthead />
      <div className="more" id="more">
        <div className="shell">
          <FunFactsRail />
          <MainContent />
          <FounderRail />
        </div>

        {/* Mission & Vision Section — Distinct and separate from home page articles */}
        <section className="mission-vision-section" id="mission-vision" aria-label="Mission and Vision">
          <div className="mission-vision-cards">
            <div className="mission-card">
              <h4>Mission</h4>
              <p>
                To house and train persons with intellectual disability before facilitating their employment
                and independent living within the community.
              </p>
            </div>
            <div className="vision-card">
              <h4>Vision</h4>
              <p>
                A society in which the less fortunate live with dignity, pride and as productive members of
                that society.
              </p>
            </div>
          </div>
        </section>

        {/* Give Section — Dedicated callout banner */}
        <section className="give" id="give" aria-label="Give and Support">
          <h2>Give</h2>
          <p>Every contribution, whatever its size, helps us bring one more person into the circle.</p>
          <div className="row">
            <Link className="solid" to="/donation">Make a donation</Link>
            <a className="hollow" href="#contact">Volunteer with us</a>
          </div>
        </section>
      </div>
    </>
  )
}

