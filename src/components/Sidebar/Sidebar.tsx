import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import IconButton from '../IconButton/IconButton'
import logo from '../../assets/brand/Logo.svg'
import icPanelLeft from '../../assets/icons/ic_panel_left.svg'
import icCompass from '../../assets/icons/ic_compass_OL.svg'
import icVideoAi from '../../assets/icons/ic_video_ai.svg'
import icSongAi from '../../assets/icons/ic_song_ai.svg'
import icStoryAi from '../../assets/icons/ic_story_ai.svg'
import icHistory from '../../assets/icons/ic_history_OL.svg'
import icFileText from '../../assets/icons/ic_file_text.svg'
import './Sidebar.css'

// href "#" means that page doesn't exist in the prototype yet.
const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: icCompass, href: '/home' },
  { key: 'mv', label: 'AI Music Video', icon: icVideoAi, href: '/mv-create' },
  { key: 'song', label: 'AI Song', icon: icSongAi, href: '/song-create' },
  { key: 'story', label: 'AI Storybook', icon: icStoryAi, badge: 'NEW', href: '#' },
  { key: 'history', label: 'History', icon: icHistory, href: '#' },
  { key: 'blog', label: 'Blog', icon: icFileText, href: '#' },
]

// Below Laptop (1024px), the sidebar collapses to icon-only by default.
// A manual toggle can override that default at any width.
const COLLAPSE_QUERY = '(max-width: 1024px)'

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(COLLAPSE_QUERY).matches : false,
  )
  const manuallyOverridden = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(COLLAPSE_QUERY)
    const handleChange = (event: MediaQueryListEvent) => {
      if (!manuallyOverridden.current) setCollapsed(event.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  function toggleCollapsed() {
    manuallyOverridden.current = true
    setCollapsed((current) => !current)
  }

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  function isActive(href: string) {
    if (href === '#') return false
    if (href === '/home') return pathname === '/' || pathname.startsWith('/home')
    return pathname.startsWith(href)
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__logo-row">
        {!collapsed && (
          <a href="/home" className="sidebar__logo">
            <img src={logo} alt="MUSE" />
          </a>
        )}
        <IconButton
          size="Small"
          variant="Ghost"
          icon={icPanelLeft}
          label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleCollapsed}
        />
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`sidebar__nav-item${isActive(item.href) ? ' sidebar__nav-item--active' : ''}`}
          >
            <span className="sidebar__nav-icon" style={maskStyle(item.icon)} aria-hidden="true" />
            <span className="sidebar__nav-label">
              <span className="sidebar__nav-label-text">{item.label}</span>
              {item.badge && <span className="sidebar__nav-badge">{item.badge}</span>}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
