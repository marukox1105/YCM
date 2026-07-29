import { useState } from 'react'
import { createPortal } from 'react-dom'
import icClose from '../../assets/icons/ic_close.svg'
import './ShareDialog.css'

// Real Web Share API on devices that support it (mostly mobile — the
// native OS share sheet). Call this from a share button's onClick; it
// either hands off to the OS or tells the caller to open <ShareDialog>.
export function shareOrOpenDialog(title: string, openDialog: () => void) {
  if (navigator.share) {
    navigator.share({ title, text: `Check out "${title}" on MUSE`, url: window.location.href }).catch(() => {})
  } else {
    openDialog()
  }
}

interface ShareDialogProps {
  title: string
  isOpen: boolean
  onClose: () => void
}

// Desktop fallback for devices without the Web Share API — a bigger,
// centered dialog (not a small anchored dropdown), since this is shared by
// every list row's Share button, not just one contained panel.
function ShareDialog({ title, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = window.location.href
  const shareText = `Check out "${title}" on MUSE`

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  // Portalled to <body> — this renders <a> tags (the share-intent links),
  // and ShareDialog is opened from Share buttons that sometimes live inside
  // a card/row that's itself wrapped in a link (e.g. New Songs Section).
  // Mounting in place would nest <a> inside <a>, which is invalid HTML and
  // makes the browser mangle the DOM instead of rendering the dialog.
  return createPortal(
    <div className="share-dialog-overlay">
      <div className="share-dialog-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="share-dialog" role="dialog" aria-label="Share">
        <div className="share-dialog__header">
          <p className="share-dialog__title">Share</p>
          <button type="button" className="share-dialog__close" onClick={onClose} aria-label="Close">
            <img src={icClose} alt="" className="share-dialog__close-icon" />
          </button>
        </div>

        <p className="share-dialog__subject">{title}</p>

        <div className="share-dialog__options">
          <button type="button" className="share-dialog__option" onClick={handleCopyLink}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <a
            className="share-dialog__option"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share to X
          </a>
          <a
            className="share-dialog__option"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share to Facebook
          </a>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ShareDialog
