import type { CSSProperties } from 'react'
import icCredit from '../../assets/icons/ic_credit.svg'
import icAdd from '../../assets/icons/ic_add.svg'
import './RoomNavbar.css'

// Figma "Navbar" (node 1351:28872 and siblings) — used on "Feature Room"
// pages (e.g. Song Create). Unlike DetailNavbar, there's no Back link — just
// a bare page title plus the credit balance.

interface RoomNavbarProps {
  title: string
  credits: number
}

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function RoomNavbar({ title, credits }: RoomNavbarProps) {
  return (
    <header className="room-navbar">
      <p className="room-navbar__title">{title}</p>

      <div className="room-navbar__credit">
        <img src={icCredit} alt="" className="room-navbar__credit-icon" />
        <span className="room-navbar__credit-count">{credits}</span>
        <span className="room-navbar__credit-add" style={maskStyle(icAdd)} aria-hidden="true" />
      </div>
    </header>
  )
}

export default RoomNavbar
