import type { CSSProperties } from 'react'
import icCredit from '../../assets/icons/ic_credit.svg'
import icAdd from '../../assets/icons/ic_add.svg'
import './CreditBalance.css'

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function CreditBalance({ credits }: { credits: number }) {
  return (
    <div className="credit-balance">
      <img src={icCredit} alt="" />
      <span>{credits}</span>
      <span className="credit-balance__add" style={maskStyle(icAdd)} aria-hidden="true" />
    </div>
  )
}

export default CreditBalance
