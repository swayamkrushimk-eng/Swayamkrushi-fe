import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { fetchCommitteeMembers } from '../services/api'
import manjulaPortrait from '../assets/images/manjula-portrait.png'
import sJayramPortrait from '../assets/images/s-jayram-portrait.jpg'
import './CommitteePage.css'

export const COMMITTEE_MEMBERS = [
  {
    id: 'manjulaa-kalyaan',
    name: 'Dr. Manjulaa Kalyaan',
    role: 'Founder & Director',
    roleCategory: 'Founder',
    designation: 'Founder Director, Swayamkrushi',
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
    designation: 'Advocate, Supreme Court BAR',
    credentials: 'President of Blind Cricket for Andhra Pradesh State Board',
    badge: 'PATRON',
    colorTheme: 'gold',
    bio: 'Eminent constitutional jurist and advocate at the Supreme Court Bar. Dr. Saratbabu is a dedicated champion of disability rights and sports inclusion, leading the Blind Cricket Association of Andhra Pradesh State Board and offering long-standing legal patronage to Swayamkrushi.',
    tags: ['Supreme Court BAR', 'President, AP Blind Cricket', 'Legal Patron'],
    initials: 'CS'
  },
  {
    id: 'ram-prasad-talluri',
    name: 'Mr. Ram Prasad Talluri',
    role: 'President',
    roleCategory: 'Presidency',
    designation: 'President, Managing Committee',
    credentials: 'Philanthropist & Institutional Leader',
    badge: 'PRESIDENT',
    colorTheme: 'indigo',
    bio: 'Providing strategic executive governance, corporate partnerships, and philanthropic support to advance Swayamkrushi’s campus expansion and rehabilitation programs.',
    tags: ['Executive Governance', 'Philanthropy', 'Institutional Growth'],
    initials: 'RT'
  },
  {
    id: 'jayaram-reddy',
    name: 'Mr. A. Jayaram Reddy',
    role: 'President',
    roleCategory: 'Presidency',
    designation: 'President, Managing Committee',
    credentials: 'Civic Leader & Institutional Administrator',
    badge: 'PRESIDENT',
    colorTheme: 'indigo',
    bio: 'Seasoned administrator steering organizational compliance, community relations, and sustainable infrastructure programs for the organization.',
    tags: ['Policy Governance', 'Infrastructure', 'Community Relations'],
    initials: 'JR'
  },
  {
    id: 'satyanarayana-murthy',
    name: 'Capt. Varanasi Satyanarayana Murthy',
    role: 'Vice President',
    roleCategory: 'Presidency',
    designation: 'Vice President, Managing Committee',
    credentials: 'Master Mariner & Veteran Administrator',
    badge: 'VICE PRESIDENT',
    colorTheme: 'burgundy',
    bio: 'Brings disciplined operational governance, administrative expertise, and crisis management leadership to Swayamkrushi’s residential welfare and daily campus routines.',
    tags: ['Master Mariner', 'Campus Operations', 'Welfare Management'],
    initials: 'VM'
  },
  {
    id: 'bhanoji-rao',
    name: 'Bhanoji Rao AVSM VSM (Retd)',
    role: 'Vice President',
    roleCategory: 'Presidency',
    designation: 'Vice President, Managing Committee',
    credentials: 'Ati Vishisht Seva Medal (AVSM) · Vishisht Seva Medal (VSM)',
    badge: 'VICE PRESIDENT',
    colorTheme: 'burgundy',
    bio: 'Decorated military commander and recipient of the prestigious presidential AVSM and VSM honors. Providing highest-standard ethical stewardship, national outreach, and institutional mentorship.',
    tags: ['AVSM & VSM Recipient', 'Military Veteran', 'Ethical Governance'],
    initials: 'BR'
  },
  {
    id: 't-suresh',
    name: 'Mr. T. Suresh',
    role: 'Secretary',
    roleCategory: 'Secretariat',
    designation: 'Secretary (Group Captain Retd)',
    credentials: 'Honorary Secretary · Defense & Aviation Veteran',
    badge: 'SECRETARY',
    colorTheme: 'indigo',
    bio: 'Distinguished defense veteran bringing organizational rigor, statutory governance, and operational precision to the Managing Committee secretariat.',
    tags: ['Group Captain Retd', 'Secretariat Admin', 'Statutory Compliance'],
    initials: 'TS'
  },
  {
    id: 'b-suresh-kumar',
    name: 'Mr. B. Suresh Kumar',
    role: 'Secretary',
    roleCategory: 'Secretariat',
    designation: 'Secretary (Advocate)',
    credentials: 'Honorary Secretary · Legal Counsel',
    badge: 'SECRETARY',
    colorTheme: 'indigo',
    bio: 'Practicing advocate managing legal compliance, statutory filings, society trust matters, and safeguarding the rights and legal protections of the trainees and residents.',
    tags: ['Advocate & Legal Counsel', 'Rights Advocacy', 'Regulatory Compliance'],
    initials: 'SK'
  },
  {
    id: 'malleswari-bandaru',
    name: 'Dr. Malleswari Bandaru',
    role: 'Executive Member',
    roleCategory: 'Executive',
    designation: 'Executive Committee Member',
    credentials: 'Academic & Healthcare Consultant',
    badge: 'EXECUTIVE MEMBER',
    colorTheme: 'slate',
    bio: 'Provides specialized clinical and therapeutic insights, supporting special educators in curating psychological and adaptive learning protocols for residents.',
    tags: ['Healthcare Advisory', 'Special Education', 'Clinical Support'],
    initials: 'MB'
  },
  {
    id: 's-jayram',
    name: 'Mr. S. Jayram',
    role: 'Executive Member',
    roleCategory: 'Executive',
    designation: 'Executive Committee Member',
    credentials: 'Community Outreach & Vocational Specialist',
    badge: 'EXECUTIVE MEMBER',
    colorTheme: 'slate',
    image: sJayramPortrait,
    bio: 'Facilitates community engagement, family counseling networks, and vocational workshops to help young adults transition smoothly into workplace employment.',
    tags: ['Vocational Outreach', 'Family Support', 'Trainee Placement'],
    initials: 'SJ'
  },
  {
    id: 'k-jayalakshmi',
    name: 'Mrs. K. Jayalakshmi',
    role: 'Executive Member',
    roleCategory: 'Executive',
    designation: 'Executive Committee Member',
    credentials: 'Residential Welfare & Vocational Mentorship',
    badge: 'EXECUTIVE MEMBER',
    colorTheme: 'slate',
    bio: 'Champions daily quality of life in the group homes, arts-and-crafts training, and compassionate residential mentorship for residents with intellectual disabilities.',
    tags: ['Group Home Care', 'Vocational Crafts', 'Resident Welfare'],
    initials: 'KJ'
  }
]

const CATEGORIES = [
  { id: 'all', label: 'All Members' },
  { id: 'founder', label: 'Founder & Patron' },
  { id: 'presidency', label: 'Presidents' },
  { id: 'secretariat', label: 'Secretariat' },
  { id: 'executive', label: 'Executive Committee' }
]

export default function CommitteePage() {
  const [membersList, setMembersList] = useState(COMMITTEE_MEMBERS)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadMembers() {
      try {
        const data = await fetchCommitteeMembers()
        if (Array.isArray(data) && data.length > 0) {
          // Merge portrait image references if string matches static imports
          const mapped = data.map((m) => {
            if (m.id === 'manjulaa-kalyaan' && (!m.image || m.image === 'manjulaPortrait')) {
              return { ...m, image: manjulaPortrait }
            }
            if (m.id === 's-jayram' && (!m.image || m.image === 'sJayramPortrait')) {
              return { ...m, image: sJayramPortrait }
            }
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

  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      const matchCategory =
        activeCategory === 'all' ||
        (activeCategory === 'founder' && (m.roleCategory === 'Founder' || m.roleCategory === 'Patron')) ||
        (activeCategory === 'presidency' && m.roleCategory === 'Presidency') ||
        (activeCategory === 'secretariat' && m.roleCategory === 'Secretariat') ||
        (activeCategory === 'executive' && m.roleCategory === 'Executive')

      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q)) ||
        (m.designation && m.designation.toLowerCase().includes(q)) ||
        (m.credentials && m.credentials.toLowerCase().includes(q)) ||
        (m.bio && m.bio.toLowerCase().includes(q)) ||
        (m.tags && Array.isArray(m.tags) && m.tags.some((t) => t.toLowerCase().includes(q)))

      return matchCategory && matchSearch
    })
  }, [membersList, activeCategory, searchQuery])

  return (
    <>
      <SEO
        title="Managing Committee | Swayamkrushi"
        description="Meet the Managing Committee, Patron, and Executive Board of Swayamkrushi NGO guiding disability rehabilitation, special education, and group homes."
      />

      <div className="committee-page-wrap">
        {/* Breadcrumb Navigation */}
        <nav className="committee-breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-back-link">
            &larr; Front Page
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-category">GOVERNANCE & LEADERSHIP</span>
        </nav>

        {/* Editorial Masthead Header */}
        <header className="committee-header">
          <div className="committee-kicker">
            <span className="badge-dot" />
            <span>ESTABLISHED 1991 · SOCIETY REG. NO. 3608/1991</span>
          </div>
          <h1 className="committee-headline">Managing Committee</h1>
          <p className="committee-lede">
            Governed by senior jurists, military veterans, visionary educators, and civic leaders dedicated to self-reliance, lifelong security, and dignity for persons with intellectual disabilities.
          </p>

          {/* Clean Metric Stats */}
          <div className="committee-metrics-grid">
            <div className="committee-metric-card">
              <span className="metric-num">35+</span>
              <span className="metric-label">Years of Service</span>
            </div>
            <div className="committee-metric-card">
              <span className="metric-num">11</span>
              <span className="metric-label">Governing Leaders</span>
            </div>
            <div className="committee-metric-card">
              <span className="metric-num">4</span>
              <span className="metric-label">National Awards</span>
            </div>
            <div className="committee-metric-card">
              <span className="metric-num">100%</span>
              <span className="metric-label">Fiduciary Care</span>
            </div>
          </div>
        </header>

        {/* Filter Controls Bar */}
        <div className="committee-controls-bar">
          <div className="committee-tabs-nav" role="tablist">
            {CATEGORIES.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`committee-tab-btn ${activeCategory === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(tab.id)}
                role="tab"
                aria-selected={activeCategory === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="committee-search-box">
            <svg className="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, role, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search committee members"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Profile Card Grid (Styled as reference layout) */}
        <div className="committee-grid">
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              className={`committee-profile-card card-theme-${member.colorTheme} ${member.id === 'manjulaa-kalyaan' ? 'is-founder-card' : ''}`}
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
                  <div className={`profile-card-placeholder-banner ${member.colorTheme}`}>
                    <div className="profile-banner-crest">
                      <span className="profile-monogram-text">{member.initials}</span>
                    </div>
                  </div>
                )}

                {/* Overlaid Badges */}
                <div className="profile-card-top-overlays">
                  <span className="profile-card-role-pill">{member.badge}</span>
                </div>
              </div>

              {/* Card Body Content */}
              <div className="profile-card-body">
                <h3 className="profile-card-name">{member.name}</h3>
                <p className="profile-card-designation">{member.designation}</p>
                {member.credentials && (
                  <p className="profile-card-credentials">{member.credentials}</p>
                )}

                <div className="profile-card-divider" />

                <p className="profile-card-bio">{member.bio}</p>

                {member.tags && member.tags.length > 0 && (
                  <div className="profile-card-tags">
                    {member.tags.map((tag, idx) => (
                      <span key={idx} className="profile-tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="no-members-found">
            <p>No committee members found matching &ldquo;{searchQuery}&rdquo;.</p>
            <button
              type="button"
              className="reset-filter-btn"
              onClick={() => {
                setActiveCategory('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Governance & Fiduciary Commitment Callout */}
        <section className="governance-pledge-section">
          <div className="pledge-inner">
            <div className="pledge-emblem">&#9878;</div>
            <div className="pledge-content">
              <h3>Fiduciary Governance & Non-Profit Integrity</h3>
              <p>
                Swayamkrushi is registered under the Societies Registration Act (Reg. No. 3608/1991) with 12A, 80G, CSR-1, and Rights of Persons with Disabilities Act compliances. All committee appointments are voluntary and dedicated to transparent, ethical stewardship and the lifelong security of our residents.
              </p>
            </div>
          </div>
        </section>

        {/* Contact and Collaboration Footer */}
        <div className="committee-cta-row">
          <div className="cta-col">
            <h4>Inquiries for the Secretariat</h4>
            <p>For institutional partnerships, donor compliance, or committee correspondences, reach out directly to our administrative office.</p>
            <Link to="/contact" className="committee-action-btn">
              Contact Secretariat &rarr;
            </Link>
          </div>
          <div className="cta-col">
            <h4>Support Swayamkrushi</h4>
            <p>Join hands with our leadership to empower one more person into the circle of self-reliance and dignity.</p>
            <a href="#give" className="committee-action-btn solid">
              Join Our Family &rarr;
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
