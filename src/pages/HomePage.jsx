import SEO from '../components/SEO'
import Masthead from '../components/Masthead'
import FunFactsRail from '../components/FunFactsRail'
import MainContent from '../components/MainContent'
import FounderRail from '../components/FounderRail'

export default function HomePage() {
  return (
    <>
      <SEO
        title="Swayamkrushi | Self Reliance for Persons with Intellectual Disability"
        description="Swayamkrushi (Reg. No. 3608/1991) is a premier non-profit organization in Secunderabad, Telangana offering pioneering group homes, residential care, special education, speech & physiotherapy, and recognized B.Ed Special Education."
        keywords="Swayamkrushi, NGO Hyderabad, special education Secunderabad, intellectual disability residential care, group homes Telangana, vocational training special needs, Manjula Kalyan, NGO India"
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

