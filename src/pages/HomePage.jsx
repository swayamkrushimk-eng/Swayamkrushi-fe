import { useState, useEffect } from 'react'
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
      </div>
    </>
  )
}

