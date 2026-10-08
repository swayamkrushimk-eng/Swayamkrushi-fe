import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import { fetchCommitteeMembers } from '../services/api'
import manjulaPortrait from '../assets/images/manjula-portrait.png'
import chennaSaratbabuPortrait from '../assets/images/chenna-saratbabu-portrait.jpg'
import bhanojiRaoPortrait from '../assets/images/bhanoji-rao-portrait.jpg'
import tSureshPortrait from '../assets/images/t-suresh-portrait.jpg'
import ramPrasadPortrait from '../assets/images/ram-prasad-talluri.jpg'
import satyanarayanaMurthyPortrait from '../assets/images/satyanarayana-murthy-portrait.jpg'
import malleswariBandaruPortrait from '../assets/images/malleswari-bandaru-portrait.jpg'
import sJayramPortrait from '../assets/images/s-jayram-portrait.jpg'
import bSureshKumarPortrait from '../assets/images/b-suresh-kumar-portrait.jpg'
import kJayalakshmiPortrait from '../assets/images/k-jayalakshmi-portrait.jpg'
import './CommitteePage.css'

export const COMMITTEE_MEMBERS = [
  {
    id: 'manjulaa-kalyaan',
    name: 'Dr. Manjulaa Kalyaan',
    role: 'Founder Director',
    roleCategory: 'Founder',
    designation: 'Founder Director',
    credentials: 'Four-time National Award Winner · RCI Nominated Expert',
    badge: 'FOUNDER DIRECTOR',
    colorTheme: 'burgundy',
    image: manjulaPortrait,
    bio: 'Visionary special educator who established Swayamkrushi in 1991. Starting with two girls in a rented flat, Dr. Kalyaan built South India’s premier model group homes, a five-acre permanent campus, and an affiliated B.Ed Special Education collegiate institution.',
    tags: ['Founded 1991', '4x National Awardee', 'Group Homes Pioneer', 'B.Ed Institution'],
    initials: 'MK'
  },
  {
    id: 'chenna-saratbabu',
    name: 'Dr. Chenna Saratbabu',
    role: 'Patron',
    roleCategory: 'Patron',
    designation: 'Patron',
    credentials: 'Advocate Supreme Court BAR · President of Blind Cricket for Andhra Pradesh State Board',
    badge: 'PATRON',
    colorTheme: 'gold',
    image: chennaSaratbabuPortrait,
    bio: 'Eminent constitutional jurist and advocate at the Supreme Court Bar. Dr. Saratbabu is a dedicated champion of disability rights and sports inclusion, leading the Blind Cricket Association of Andhra Pradesh State Board and offering long-standing legal patronage to Swayamkrushi.',
    tags: ['Supreme Court BAR', 'President, AP Blind Cricket', 'Legal Patron'],
    initials: 'CS'
  },
  {
    id: 'jayaram-reddy',
    name: 'Mr. A. Jayaram Reddy',
    role: 'President',
    roleCategory: 'Presidency',
    designation: 'President',
    credentials: 'Civic Leader & Institutional Administrator',
    badge: 'PRESIDENT',
    colorTheme: 'indigo',
    image: '',
    bio: 'Seasoned administrator steering organizational compliance, community relations, and sustainable infrastructure programs for the organization.',
    tags: ['Policy Governance', 'Infrastructure', 'Community Relations'],
    initials: 'JR'
  },
  {
    id: 'bhanoji-rao',
    name: 'Bhanoji Rao AVSM VSM (Retd)',
    role: 'Vice President',
    roleCategory: 'Presidency',
    designation: 'Vice President',
    credentials: 'Ati Vishisht Seva Medal (AVSM) · Vishisht Seva Medal (VSM)',
    badge: 'VICE PRESIDENT',
    colorTheme: 'burgundy',
    image: bhanojiRaoPortrait,
    bio: 'Decorated military commander and recipient of the prestigious presidential AVSM and VSM honors. Providing highest-standard ethical stewardship, national outreach, and institutional mentorship.',
    tags: ['AVSM & VSM Recipient', 'Military Veteran', 'Ethical Governance'],
    initials: 'BR'
  },
  {
    id: 't-suresh',
    name: 'Mr. T. Suresh',
    role: 'Secretary',
    roleCategory: 'Secretariat',
    designation: 'Secretary',
    credentials: 'Group Captain',
    badge: 'SECRETARY',
    colorTheme: 'indigo',
    image: tSureshPortrait,
    bio: 'Distinguished defense veteran bringing organizational rigor, statutory governance, and operational precision to the Managing Committee secretariat.',
    tags: ['Group Captain Retd', 'Secretariat Admin', 'Statutory Compliance'],
    initials: 'TS'
  },
  {
    id: 'ram-prasad-talluri',
    name: 'Mr. Ram Prasad Talluri',
    role: 'Committee Member',
    roleCategory: 'Executive',
    designation: 'Committee Member',
    credentials: 'Philanthropist & Institutional Leader',
    badge: 'COMMITTEE MEMBER',
    colorTheme: 'slate',
    image: ramPrasadPortrait,
    bio: 'Providing strategic executive governance, corporate partnerships, and philanthropic support to advance Swayamkrushi’s campus expansion and rehabilitation programs.',
    tags: ['Executive Governance', 'Philanthropy', 'Institutional Growth'],
    initials: 'RT'
  },
  {
    id: 'satyanarayana-murthy',
    name: 'Capt. Varanasi Satyanarayana Murthy',
    role: 'Committee Member',
    roleCategory: 'Executive',
    designation: 'Committee Member',
    credentials: 'Master Mariner & Veteran Administrator',
    badge: 'COMMITTEE MEMBER',
    colorTheme: 'slate',
    image: satyanarayanaMurthyPortrait,
    bio: 'Brings disciplined operational governance, administrative expertise, and crisis management leadership to Swayamkrushi’s residential welfare and daily campus routines.',
    tags: ['Master Mariner', 'Campus Operations', 'Welfare Management'],
    initials: 'VM'
  },
  {
    id: 'malleswari-bandaru',
    name: 'Dr. Malleswari Bandaru',
    role: 'Committee Member',
    roleCategory: 'Executive',
    designation: 'Committee Member',
    credentials: 'Academic & Healthcare Consultant',
    badge: 'COMMITTEE MEMBER',
    colorTheme: 'slate',
    image: malleswariBandaruPortrait,
    bio: 'Provides specialized clinical and therapeutic insights, supporting special educators in curating psychological and adaptive learning protocols for residents.',
    tags: ['Healthcare Advisory', 'Special Education', 'Clinical Support'],
    initials: 'MB'
  },
  {
    id: 's-jayram',
    name: 'Mr. S. Jayram',
    role: 'Committee Member',
    roleCategory: 'Executive',
    designation: 'Committee Member',
    credentials: 'Community Outreach & Vocational Specialist',
    badge: 'COMMITTEE MEMBER',
    colorTheme: 'slate',
    image: sJayramPortrait,
    bio: 'Facilitates community engagement, family counseling networks, and vocational workshops to help young adults transition smoothly into workplace employment.',
    tags: ['Vocational Outreach', 'Family Support', 'Trainee Placement'],
    initials: 'SJ'
  },
  {
    id: 'b-suresh-kumar',
    name: 'Mr. B. Suresh Kumar',
    role: 'Committee Member',
    roleCategory: 'Executive',
    designation: 'Committee Member',
    credentials: 'Advocate',
    badge: 'COMMITTEE MEMBER',
    colorTheme: 'slate',
    image: bSureshKumarPortrait,
    bio: 'Practicing advocate managing legal compliance, statutory filings, society trust matters, and safeguarding the rights and legal protections of the trainees and residents.',
    tags: ['Advocate & Legal Counsel', 'Rights Advocacy', 'Regulatory Compliance'],
    initials: 'SK'
  },
  {
    id: 'k-jayalakshmi',
    name: 'Mrs. K. Jayalakshmi',
    role: 'Committee Member',
    roleCategory: 'Executive',
    designation: 'Committee Member',
    credentials: 'Residential Welfare & Vocational Mentorship',
    badge: 'COMMITTEE MEMBER',
    colorTheme: 'slate',
    image: kJayalakshmiPortrait,
    bio: 'Champions daily quality of life in the group homes, arts-and-crafts training, and compassionate residential mentorship for residents with intellectual disabilities.',
    tags: ['Group Home Care', 'Vocational Crafts', 'Resident Welfare'],
    initials: 'KJ'
  }
]

export default function CommitteePage() {
  const [membersList, setMembersList] = useState(COMMITTEE_MEMBERS)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadMembers() {
      try {
        const data = await fetchCommitteeMembers()
        if (Array.isArray(data) && data.length > 0) {
          // Merge portrait image references if string matches static imports
          const mapped = data.map((m) => {
            const hasCustomUploadedUrl = m.image && (m.image.startsWith('data:') || m.image.startsWith('http') || m.image.startsWith('/uploads'))
            if (hasCustomUploadedUrl) return m

            if (m.id === 'manjulaa-kalyaan') return { ...m, image: manjulaPortrait }
            if (m.id === 'chenna-saratbabu') return { ...m, image: chennaSaratbabuPortrait }
            if (m.id === 'bhanoji-rao') return { ...m, image: bhanojiRaoPortrait }
            if (m.id === 't-suresh') return { ...m, image: tSureshPortrait }
            if (m.id === 'ram-prasad-talluri') return { ...m, image: ramPrasadPortrait }
            if (m.id === 'satyanarayana-murthy') return { ...m, image: satyanarayanaMurthyPortrait }
            if (m.id === 'malleswari-bandaru') return { ...m, image: malleswariBandaruPortrait }
            if (m.id === 's-jayram') return { ...m, image: sJayramPortrait }
            if (m.id === 'b-suresh-kumar') return { ...m, image: bSureshKumarPortrait }
            if (m.id === 'k-jayalakshmi') return { ...m, image: kJayalakshmiPortrait }
            return m
          })
          setMembersList(mapped)
        } else {
          // Seed localStorage so admin immediately has the members
          localStorage.setItem('swayamkrushi_committee_members', JSON.stringify(COMMITTEE_MEMBERS))
        }
      } catch (err) {
        console.warn('Error loading committee members:', err)
      }
    }
    loadMembers()
  }, [])

  return (
    <>
      <SEO
        title="Who is Who | Swayamkrushi"
        description="Meet the leadership, Patron, and Executive Board of Swayamkrushi NGO guiding disability rehabilitation, special education, and group homes."
      />

      <div className="committee-page-wrap">
        {/* Editorial Masthead Header */}
        <header className="committee-header">
          <h1 className="committee-headline">Who is Who</h1>
        </header>

        {/* Profile Card Grid */}
        <div className="committee-grid">
          {membersList.map((member) => {
            const roleText = (member.role && member.role.trim()) || (member.designation && member.designation.trim()) || 'Committee Member'
            return (
              <article
                key={member.id}
                className={`committee-profile-card card-theme-${member.colorTheme || 'slate'} ${member.id === 'manjulaa-kalyaan' ? 'is-founder-card' : ''}`}
              >
                {/* Top Photo / Portrait Banner Header */}
                <div className="profile-card-media-banner">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="profile-card-photo"
                    />
                  ) : (
                    <div className={`profile-card-placeholder-banner ${member.colorTheme || 'slate'}`}>
                      <div className="profile-banner-crest">
                        <span className="profile-monogram-text">{member.initials}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Body Content */}
                <div className="profile-card-body">
                  <h3 className="profile-card-name">{member.name}</h3>
                  <p className="profile-card-designation">{roleText}</p>
                  {member.credentials && (
                    <p className="profile-card-credentials">{member.credentials}</p>
                  )}

                  <div className="profile-card-divider" />

                  <p className="profile-card-bio">{member.bio}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </>
  )
}
