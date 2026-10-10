// Articles data for Left, Main, and Right shoulder sections synchronized with live database
import rawArticles from './articles_complete.json'

export const leftSideArticles = rawArticles.filter(a => a.section === 'left')
export const rightSideArticles = rawArticles.filter(a => a.section === 'right')

export const homeOfCareArticle = rawArticles.find(a => a.id === 'home-of-care') || {}
export const groupHomesArticle = rawArticles.find(a => a.id === 'group-homes') || {}
export const bedHotspotArticle = rawArticles.find(a => a.id === 'bed-hotspot') || {}
export const mainArticle = rawArticles.find(a => a.id === 'building-blocks') || {}
