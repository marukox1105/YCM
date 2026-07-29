import type { CSSProperties } from 'react'
import icCompass from '../../assets/icons/ic_compass_OL.svg'
import icHistory from '../../assets/icons/ic_history_OL.svg'
import icAdd from '../../assets/icons/ic_add.svg'
import './MobileTabBar.css'

// Figma "Bar/TabBar" (node 369:7574), from the manager's app design — only
// shown below the app-mobile breakpoint, see AppLayout + layoutMode.ts.
//
// Only Explore/Create/History exist in this reference. Sidebar's other nav
// items (AI Music Video, AI Song, AI Storybook, Blog) have no place here yet
// — this is a known gap, not a decision, flagged for follow-up.

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function MobileTabBar() {
  return (
    <nav className="mobile-tabbar">
      <button type="button" className="mobile-tabbar__item mobile-tabbar__item--active">
        <span className="mobile-tabbar__icon" style={maskStyle(icCompass)} aria-hidden="true" />
        <span className="mobile-tabbar__label">Explore</span>
      </button>

      <button type="button" className="mobile-tabbar__create" aria-label="Create">
        <span className="mobile-tabbar__create-icon" style={maskStyle(icAdd)} aria-hidden="true" />
      </button>

      <button type="button" className="mobile-tabbar__item">
        <span className="mobile-tabbar__icon" style={maskStyle(icHistory)} aria-hidden="true" />
        <span className="mobile-tabbar__label">History</span>
      </button>
    </nav>
  )
}

export default MobileTabBar
