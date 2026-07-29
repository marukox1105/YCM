import { useState } from 'react'
import type { CSSProperties } from 'react'
import Button from '../Button/Button'
import ShareDialog, { shareOrOpenDialog } from '../ShareDialog/ShareDialog'
import icPlay from '../../assets/icons/ic_play.svg'
import icAccount from '../../assets/icons/ic_account.svg'
import icHeadphones from '../../assets/icons/ic_headphones.svg'
import icFavoriteOff from '../../assets/icons/ic_favorite_off.svg'
import icFavoriteOn from '../../assets/icons/ic_favorite_on.svg'
import icShare from '../../assets/icons/ic_share.svg'
import './ListItem.css'

interface ListItemProps {
  coverImage?: string
  title: string
  /** Omitted for real songs with no creator identity data — hides the user row. */
  username?: string
  /** Falls back to a placeholder icon when omitted — most users won't have uploaded one. */
  avatarUrl?: string
  plays: number
  likes: number
  shares: number
  defaultLiked?: boolean
}

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function ListItem({
  coverImage,
  title,
  username,
  avatarUrl,
  plays,
  likes,
  shares,
  defaultLiked = false,
}: ListItemProps) {
  const [liked, setLiked] = useState(defaultLiked)
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className="list-item">
      <div className="list-item__main">
        <div className="list-item__album-art">
          {coverImage && <img src={coverImage} alt="" className="list-item__album-image" />}
          <div className="list-item__album-scrim" aria-hidden="true" />
          <span className="list-item__play-icon" style={maskStyle(icPlay)} aria-hidden="true" />
        </div>

        <div className="list-item__info">
          <p className="list-item__title">{title}</p>

          {username && (
            <div className="list-item__user-row">
              <span className="list-item__avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="list-item__avatar-image" />
                ) : (
                  <span className="list-item__avatar-icon" style={maskStyle(icAccount)} aria-hidden="true" />
                )}
              </span>
              <span className="list-item__username">{username}</span>
            </div>
          )}

          <div className="list-item__social-row">
            <span className="list-item__stat">
              <span className="list-item__stat-icon" style={maskStyle(icHeadphones)} aria-hidden="true" />
              {plays}
            </span>
            <span className="list-item__stat">
              <span className="list-item__stat-icon" style={maskStyle(icFavoriteOff)} aria-hidden="true" />
              {likes}
            </span>
            <span className="list-item__stat">
              <span className="list-item__stat-icon" style={maskStyle(icShare)} aria-hidden="true" />
              {shares}
            </span>
          </div>
        </div>
      </div>

      {/* preventDefault + stopPropagation (bubble phase, after each button's
          own onClick has already run): ListItem is sometimes wrapped in a
          link (e.g. New Songs Section) to open the full song page — these
          buttons should act in place, not also navigate there. Just
          stopPropagation isn't enough: it blocks other listeners but not
          the anchor's own built-in navigation, which only preventDefault
          stops. */}
      <div
        className="list-item__actions"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <button
          type="button"
          className={`list-item__like${liked ? ' list-item__like--active' : ''}`}
          onClick={() => setLiked((current) => !current)}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <span className="list-item__like-icon" style={maskStyle(liked ? icFavoriteOn : icFavoriteOff)} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="list-item__share"
          onClick={() => shareOrOpenDialog(title, () => setShareOpen(true))}
          aria-label="Share"
        >
          <span className="list-item__share-icon" style={maskStyle(icShare)} aria-hidden="true" />
        </button>
        <Button size="Small" variant="Tertiary">
          Create
        </Button>
      </div>

      <ShareDialog title={title} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}

export default ListItem
