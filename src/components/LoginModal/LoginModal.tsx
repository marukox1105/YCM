import { useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../Button/Button'
import icClose from '../../assets/icons/ic_close.svg'
import './LoginModal.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

// UI-only prototype — no backend to authenticate against, so this is a
// plain mock: local state for the two fields, submit just closes the
// modal (a stand-in for "success") instead of pretending to call an API.
function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  // Portalled to <body>, like ShareDialog — standard practice for an
  // overlay so it isn't affected by an ancestor's stacking context/overflow.
  return createPortal(
    <div className="login-modal-overlay">
      <div className="login-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="login-modal" role="dialog" aria-label="Log in">
        <div className="login-modal__header">
          <p className="login-modal__title">Log in</p>
          <button type="button" className="login-modal__close" onClick={onClose} aria-label="Close">
            <img src={icClose} alt="" className="login-modal__close-icon" />
          </button>
        </div>

        <div className="login-modal__field">
          <label className="login-modal__label" htmlFor="login-modal-email">
            Email
          </label>
          <input
            id="login-modal-email"
            type="email"
            className="login-modal__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="login-modal__field">
          <label className="login-modal__label" htmlFor="login-modal-password">
            Password
          </label>
          <input
            id="login-modal-password"
            type="password"
            className="login-modal__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Button size="Large" variant="Primary" className="login-modal__submit" onClick={onClose}>
          Log in
        </Button>

        <div className="login-modal__divider">
          <span className="login-modal__divider-line" />
          <span className="login-modal__divider-text">or</span>
          <span className="login-modal__divider-line" />
        </div>

        {/* Same mock-only rule as the email form above — no real OAuth
            wired up, just the buttons a real login screen would have. */}
        <button type="button" className="login-modal__social" onClick={onClose}>
          Continue with Google
        </button>
        <button type="button" className="login-modal__social" onClick={onClose}>
          Continue with Apple
        </button>

        <p className="login-modal__footer">
          Don&apos;t have an account?{' '}
          <a href="#" className="login-modal__footer-link">
            Start for Free
          </a>
        </p>
      </div>
    </div>,
    document.body,
  )
}

export default LoginModal
