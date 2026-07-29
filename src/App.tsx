import './App.css'
import ComponentsPage from './pages/ComponentsPage/ComponentsPage'
import HomePage from './pages/HomePage/HomePage'
import MVDetailPage from './pages/MVDetailPage/MVDetailPage'
import SongDetailPage from './pages/SongDetailPage/SongDetailPage'

function App() {
  if (window.location.pathname.startsWith('/components')) {
    return <ComponentsPage />
  }

  if (window.location.pathname.startsWith('/home')) {
    return <HomePage />
  }

  if (window.location.pathname.startsWith('/mv-detail')) {
    return <MVDetailPage />
  }

  if (window.location.pathname.startsWith('/song-detail')) {
    return <SongDetailPage />
  }

  return (
    <div className="page">
      <p>YCM UI Prototype</p>
    </div>
  )
}

export default App
