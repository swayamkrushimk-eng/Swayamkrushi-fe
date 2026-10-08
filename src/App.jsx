import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import AccoladesPage from './pages/AccoladesPage'
import FaqPage from './pages/FaqPage'
import InsidersPage from './pages/InsidersPage'
import AddonsPage from './pages/AddonsPage'
import ContactPage from './pages/ContactPage'
import CommitteePage from './pages/CommitteePage'
import { trackPageView } from './services/api'

function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.hash)
  }, [location])

  return null
}

function App() {
  return (
    <HashRouter>
      <PageTracker />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/accolades" element={<AccoladesPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/insiders" element={<InsidersPage />} />
        <Route path="/insideros" element={<InsidersPage />} />
        <Route path="/committee" element={<CommitteePage />} />
        <Route path="/managing-committee" element={<CommitteePage />} />
        <Route path="/about/committee" element={<CommitteePage />} />
        <Route path="/addons" element={<AddonsPage />} />
        <Route path="/add-ons" element={<AddonsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </HashRouter>
  )
}

export default App

