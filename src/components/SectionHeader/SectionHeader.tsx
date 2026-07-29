import type { CSSProperties } from 'react'
import icChevronRight from '../../assets/icons/ic_chevron-right.svg'
import './SectionHeader.css'

interface SectionHeaderProps {
  title: string
  /** Omit the "See all" link — used on the page a "See all" link leads to. */
  showSeeAll?: boolean
  /** Where "See all" links to. Defaults to "#" (not wired to a page yet). */
  seeAllHref?: string
}

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function SectionHeader({ title, showSeeAll = true, seeAllHref = '#' }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <p className="section-header__title">{title}</p>
      {showSeeAll && (
        <a href={seeAllHref} className="section-header__see-all">
          See all
          <span className="section-header__see-all-icon" style={maskStyle(icChevronRight)} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}

export default SectionHeader
