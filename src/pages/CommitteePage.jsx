import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import manjulaPortrait from '../assets/images/manjula-portrait.png'
import './CommitteePage.css'

export const COMMITTEE_MEMBERS = [
  {
    id: 'chenna-saratbabu',
    name: 'Dr. Chenna Saratbabu',
    role: 'Patron',
    designation: 'Advocate, Supreme Court BAR',
    credentials: 'President of Blind Cricket for Andhra Pradesh State Board',
    category: 'Patron',
    tier: 'patron',
    badge: 'PATRON',
    colorTheme: 'gold',
    bio: 'Eminent legal luminary and practicing advocate at the Supreme Court Bar. Dr. Saratbabu has championed disability rights, sports empowerment, and social inclusion across the nation, presiding over the Andhra Pradesh Blind Cricket State Board and steering Swayamkrushi with seasoned legal patronage.',
    highlights: [
      'Advocate, Supreme Court Bar Association',
      'President, Blind Cricket Association of AP State Board',
      'Constitutional & Social Welfare Legal Counsel'
    ],
    initials: 'CS'
  },
  {
    id: 'manjulaa-kalyaan',
    name: 'Dr. Manjulaa Kalyaan',
    role: 'Founder & Director',
    designation: 'Founder Director, Swayamkrushi',
    credentials: 'Four-time National Award Winner · RCI Nominated Expert',
    category: 'Leadership',
    tier: 'founder',
    badge: 'FOUNDER DIRECTOR',
    colorTheme: 'burgundy',
    image: manjulaPortrait,
    bio: 'Pioneering special educator and social entrepreneur who founded Swayamkrushi in 1991. What began with two girls in a rented flat has expanded into a five-acre permanent campus, family-style group homes, and a premier B.Ed Special Education collegiate ecosystem.',
    highlights: [
      'Founded Swayamkrushi in 1991',
      'Conferred 4 National Awards for Excellence in Disability Rehabilitation',
      'Established First-of-its-Kind Group Homes in South India'
    ],
    initials: 'MK'
  },
  {
    id: 'ram-prasad-talluri',
    name: 'Mr. Ram Prasad Talluri',
    role: 'President',
    designation: 'President, Managing Committee',
    credentials: 'Philanthropist & Organizational Leader',
    category: 'Leadership',
    tier: 'president',
    badge: 'PRESIDENT',
    colorTheme: 'indigo',
    bio: 'Providing visionary executive direction, corporate collaboration, and financial stewardship to scale Swayamkrushi’s educational and residential initiatives.',
    highlights: [
      'Strategic Governance & Institutional Expansion',
      'Community Philanthropy & Stakeholder Relations'
    ],
    initials: 'RT'
  },
  {
    id: 'jayaram-reddy',
    name: 'Mr. A. Jayaram Reddy',
    role: 'President',
    designation: 'President, Managing Committee',
    credentials: 'Civic Leader & Institutional Administrator',
    category: 'Leadership',
    tier: 'president',
    badge: 'PRESIDENT',
    colorTheme: 'indigo',
    bio: 'Distinguished administrator leading policy formation, community outreach, and long-term campus infrastructure development for Swayamkrushi.',
    highlights: [
      'Policy Governance & Compliance Oversight',
      'Infrastructure & Campus Development Programs'
    ],
    initials: 'JR'
  },
  {
    id: 'satyanarayana-murthy',
    name: 'Capt. Varanasi Satyanarayana Murthy',
    role: 'Vice President',
    designation: 'Vice President, Managing Committee',
    credentials: 'Master Mariner & Veteran Administrator',
    category: 'Leadership',
    tier: 'vice-president',
    badge: 'VICE PRESIDENT',
    colorTheme: 'burgundy',
    bio: 'Bringing disciplined administrative governance, crisis management capabilities, and leadership acumen to Swayamkrushi’s day-to-day operations and residential welfare.',
    highlights: [
      'Operational Logistics & Resource Allocation',
      'Residential Security & Campus Standards'
    ],
    initials: 'VM'
  },
  {
    id: 'bhanoji-rao',
    name: 'Bhanoji Rao AVSM VSM (Retd)',
    role: 'Vice President',
    designation: 'Vice President, Managing Committee',
    credentials: 'Ati Vishisht Seva Medal (AVSM) · Vishisht Seva Medal (VSM)',
    category: 'Leadership',
    tier: 'vice-president',
    badge: 'VICE PRESIDENT',
    colorTheme: 'burgundy',
    bio: 'Decorated military commander and recipient of the prestigious AVSM and VSM presidential honors. Providing impeccable ethical governance, national outreach, and strategic institutional guidance.',
    highlights: [
      'Recipient of Presidential AVSM & VSM Medals',
      'Institutional Ethics & Fiduciary Oversight'
    ],
    initials: 'BR'
  },
  {
    id: 't-suresh',
    name: 'Mr. T. Suresh',
    role: 'Secretary',
    designation: 'Group Captain (Retd)',
    credentials: 'Honorary Secretary · Aviation & Defense Veteran',
    category: 'Secretariat',
    tier: 'secretary',
    badge: 'SECRETARY',
    colorTheme: 'indigo',
    bio: 'Distinguished defense veteran bringing high-precision management, organizational rigor, and procedural compliance to the managing committee secretariat.',
    highlights: [
      'Group Captain Veteran Leadership',
      'Statutory Documentation & Secretariat Administration'
    ],
    initials: 'TS'
  },
  {
    id: 'b-suresh-kumar',
    name: 'Mr. B. Suresh Kumar',
    role: 'Secretary',
    designation: 'Advocate',
    credentials: 'Honorary Secretary · Legal Counsel',
    category: 'Secretariat',
    tier: 'secretary',
    badge: 'SECRETARY',
    colorTheme: 'indigo',
    bio: 'Practicing advocate managing legal compliance, statutory filings, trust deeds, and safeguarding the rights and entitlements of beneficiaries under disability welfare acts.',
    highlights: [
      'Legal & Statutory Compliance Management',
      'Advocacy for Disability Entitlements & Government Relations'
    ],
    initials: 'SK'
  },
  {
    id: 'malleswari-bandaru',
    name: 'Dr. Malleswari Bandaru',
    role: 'Executive Member',
    designation: 'Executive Committee Member',
    credentials: 'Academic & Healthcare Consultant',
    category: 'Executive',
    tier: 'member',
    badge: 'EXECUTIVE MEMBER',
    colorTheme: 'slate',
    bio: 'Contributing specialized clinical, academic, and therapeutic advisory services to enrich the special education and psychological well-being of the residents.',
    highlights: [
      'Healthcare Protocol & Clinical Advisory',
      'Curriculum Integration for Special Education'
    ],
    initials: 'MB'
  },
  {
    id: 's-jayram',
    name: 'Mr. S. Jayram',
    role: 'Executive Member',
    designation: 'Executive Committee Member',
    credentials: 'Vocational Training & Community Engagement Specialist',
    category: 'Executive',
    tier: 'member',
    badge: 'EXECUTIVE MEMBER',
    colorTheme: 'slate',
    bio: 'Actively facilitating field logistics, community integration, vocational trainee placements, and family support systems.',
    highlights: [
      'Vocational Outreach & Trainee Job Placements',
      'Community Engagement & Family Counseling Support'
    ],
    initials: 'SJ'
  },
  {
    id: 'k-jayalakshmi',
    name: 'Mrs. K. Jayalakshmi',
    role: 'Executive Member',
    designation: 'Executive Committee Member',
    credentials: 'Residential Welfare & Vocational Mentor',
    category: 'Executive',
    tier: 'member',
    badge: 'EXECUTIVE MEMBER',
    colorTheme: 'slate',
    bio: 'Championing resident care, quality of life standards in the group homes, arts-and-crafts initiatives, and compassionate resident mentorship.',
    highlights: [
      'Group Home Welfare & Quality of Life Oversight',
      'Vocational Craft & Resident Mentorship Programs'
    ],
    initials: 'KJ'
  }
]

const CATEGORIES = [
  { id: 'all', label: 'All Committee' },
  { id: 'patron', label: 'Patron & Founder' },
  { id: 'leadership', label: 'Presidency' },
  { id: 'secretariat', label: 'Secretariat' },
  { id: 'executive', label: 'Executive Members' }
]

export default function CommitteePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const filteredMembers = useMemo(() => {
    return COMMITTEE_MEMBERS.filter((m) => {
      const matchCategory =
        activeCategory === 'all' ||
        (activeCategory === 'patron' && (m.category === 'Patron' || m.tier === 'founder')) ||
        (activeCategory === 'leadership' && (m.tier === 'president' || m.tier === 'vice-president')) ||
        (activeCategory === 'secretariat' && m.category === 'Secretariat') ||
        (activeCategory === 'executive' && m.category === 'Executive')

      const matchSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.credentials.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.bio.toLowerCase().includes(searchQuery.toLowerCase())

      return matchCategory && matchSearch
    })
  }, [activeCategory, searchQuery])

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

        {/* Editorial Header */}
        <header className="committee-header">
          <div className="committee-kicker">
            <span className="badge-dot" />
            <span>ESTABLISHED 1991 · SOCIETY REG. NO. 3608/1991</span>
          </div>
          <h1 className="committee-headline">The Managing Committee</h1>
          <p className="committee-lede">
            Guided by distinguished jurists, decorated military veterans, visionary educators, and civic leaders dedicated to self-reliance and lifelong dignity for persons with intellectual disabilities.
          </p>

          {/* Quick Metrics Bar */}
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
              <span className="metric-label">Voluntary Fiduciary Care</span>
            </div>
          </div>
        </header>

        {/* Filter and Search Controls */}
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
            <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
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

        {/* Member Directory Grid */}
        <div className="committee-grid">
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              className={`committee-card tier-${member.tier} theme-${member.colorTheme}`}
            >
              <div className="card-top-row">
                <div className="avatar-wrapper">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="member-avatar-img"
                    />
                  ) : (
                    <div className="member-avatar-monogram">
                      <span>{member.initials}</span>
                    </div>
                  )}
                  <span className="member-badge-pill">{member.badge}</span>
                </div>

                <div className="member-title-block">
                  <span className="member-role-category">{member.role}</span>
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-designation">{member.designation}</p>
                  {member.credentials && (
                    <p className="member-credentials">{member.credentials}</p>
                  )}
                </div>
              </div>

              <p className="member-bio">{member.bio}</p>

              {member.highlights && member.highlights.length > 0 && (
                <div className="member-highlights-box">
                  <span className="highlights-title">Key Portfolio & Responsibilities</span>
                  <ul className="highlights-list">
                    {member.highlights.map((item, idx) => (
                      <li key={idx}>
                        <span className="bullet-point">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                Swayamkrushi is registered under the Societies Registration Act (Reg. No. 3608/1991). The Managing Committee operates with strict compliance with 12A, 80G, CSR-1, and the Rights of Persons with Disabilities Act, 2016. All committee roles are non-commercial and dedicated solely to the welfare, rehabilitation, and long-term security of our trainees and residents.
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
