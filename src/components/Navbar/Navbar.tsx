import { useEffect, useRef, useState } from 'react'
import Button from '../Button/Button'
import LoginModal from '../LoginModal/LoginModal'
import icChevronDown from '../../assets/icons/ic_chevron-down.svg'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import './Navbar.css'

// Mock content — UI-only, not wired to a real i18n system yet.
// Each language is shown in its own native name so users can find their own
// language regardless of the current UI language (standard picker convention).
const LANGUAGES = [
  'English',
  '正體中文',
  '日本語',
  '한국어',
  'Deutsch',
  'Français',
  'Español',
  'Português',
  'Italiano',
  'Türkçe',
  'ภาษาไทย',
  'Bahasa Indonesia',
]

function LanguagePicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState('English')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="navbar__lang" ref={wrapperRef}>
      <Button size="Medium" variant="Tertiary" trailingIcon={icChevronDown} onClick={() => setIsOpen((open) => !open)}>
        {language}
      </Button>

      {isOpen && (
        <ul className="navbar__lang-menu">
          {LANGUAGES.map((lang) => (
            <li key={lang}>
              <button
                type="button"
                className={`navbar__lang-option${lang === language ? ' navbar__lang-option--active' : ''}`}
                onClick={() => {
                  setLanguage(lang)
                  setIsOpen(false)
                }}
              >
                {lang}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="navbar__actions">
        <LanguagePicker />
        <Button size="Medium" variant="Tertiary" onClick={() => setLoginOpen(true)}>
          Login
        </Button>
        <Button size="Medium" variant="Primary" leadingIcon={icArrowRight}>
          Start for Free
        </Button>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  )
}

export default Navbar
