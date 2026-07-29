import type { CSSProperties } from 'react'
import icArrowLeft from '../../assets/icons/ic_arrow_left.svg'
import icCredit from '../../assets/icons/ic_credit.svg'
import icAdd from '../../assets/icons/ic_add.svg'
import './DetailNavbar.css'

// Figma "Navbar" (device=Desktop, state="2nd Layer") — used on detail pages
// (e.g. MV Detail) instead of the marketing Navbar's language/login/CTA set.

interface DetailNavbarProps {
  credits: number
  backHref?: string
}

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function DetailNavbar({ credits, backHref = '/home' }: DetailNavbarProps) {
  return (
    <header className="detail-navbar">
      <a href={backHref} className="detail-navbar__back">
        <span className="detail-navbar__back-button">
          <span className="detail-navbar__back-icon" style={maskStyle(icArrowLeft)} aria-hidden="true" />
        </span>
        Back
      </a>

      <div className="detail-navbar__credit">
        <img src={icCredit} alt="" className="detail-navbar__credit-icon" />
        <span className="detail-navbar__credit-count">{credits}</span>
        <span className="detail-navbar__credit-add" style={maskStyle(icAdd)} aria-hidden="true" />
      </div>
    </header>
  )
}

export default DetailNavbar
