// Complete unabridged articles data synchronized with live database
import rawArticles from './articles_complete.json'
import birthdayImg from '../assets/images/birthday-courtyard.jpg'
import grouphomeResidentsImg from '../assets/images/grouphome-residents.jpg'
import nationalTrustImg from '../assets/images/national-trust-event.jpg'

export const articleImagesMap = {
  'home-of-care': birthdayImg,
  'group-homes': grouphomeResidentsImg,
  'bed-hotspot': null,
  'story-group-homes-initiative': grouphomeResidentsImg,
  'dare-to-dream': null,
}

export const allArticles = rawArticles.map((a) => ({
  ...a,
  heroImage: a.imageUrl || (a.id && articleImagesMap[a.id]) || null,
  imageUrl: a.imageUrl || (a.id && articleImagesMap[a.id]) || null
}))

export function getArticleById(id) {
  if (!id) return null
  const aliasMap = {
    'story-fifteen-years': 'story-15-years',
    'story-15-years': 'story-fifteen-years',
    'story-sowing-seeds': 'story-tailoring',
    'story-tailoring': 'story-sowing-seeds',
    'dare-to-dream': 'dare-to-dream',
    'daretodream': 'dare-to-dream',
  }
  const targetId = aliasMap[id] || id
  return allArticles.find((a) => a.id === targetId || a.id === id) || null
}
