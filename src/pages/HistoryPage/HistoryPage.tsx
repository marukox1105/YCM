import { useEffect, useState } from 'react'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import RoomNavbar from '../../components/RoomNavbar/RoomNavbar'
import Tabs from '../../components/Tabs/Tabs'
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch'
import { useAuth } from '../../components/AuthProvider/AuthProvider'
import { MUSIC_VIDEOS } from '../../data/musicVideos'
import { SONGS } from '../../data/songs'
import { STORYBOARD_COVER } from '../../data/storyboardClips'
import icAlert from '../../assets/icons/ic_alert.svg'
import icCheck from '../../assets/icons/ic_check.svg'
import icDelete from '../../assets/icons/ic_delete.svg'
import icDownload from '../../assets/icons/ic_download.svg'
import icEdit from '../../assets/icons/ic_edit.svg'
import icFavoriteOff from '../../assets/icons/ic_favorite_off.svg'
import icFavoriteOn from '../../assets/icons/ic_favorite_on.svg'
import icHeadphones from '../../assets/icons/ic_headphones.svg'
import icMore from '../../assets/icons/ic_more.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPublish from '../../assets/icons/ic_publish.svg'
import icScript from '../../assets/icons/ic_script.svg'
import icShare from '../../assets/icons/ic_share.svg'
import icSong from '../../assets/icons/ic_song.svg'
import icStar from '../../assets/icons/ic_star.svg'
import icTimer from '../../assets/icons/ic_timer.svg'
import icVideo from '../../assets/icons/ic_video.svg'
import './HistoryPage.css'

type HistoryType = 'Music Video' | 'Song' | 'Storyboard'
type HistoryStatus = 'Generating' | 'Done' | 'Failed' | 'Ready'
type HistoryTab = 'All' | 'Music Videos' | 'Songs' | 'Liked'

interface HistoryItem {
  id: string
  type: HistoryType
  title: string
  cover: string
  date: string
  status: HistoryStatus
  liked: boolean
  plays?: number
  likes?: number
  shares?: number
  href: string
}

const TABS: HistoryTab[] = ['All', 'Music Videos', 'Songs', 'Liked']

// Figma "New Songs Section" (node 1591:29611).
const HISTORY_ITEMS: HistoryItem[] = [
  { id: 'generating-mv', type: 'Music Video', title: 'New Music Video', cover: '', date: '2026-07-31', status: 'Generating', liked: false, href: '/history' },
  { id: 'storyboard-ready', type: 'Storyboard', title: 'Starlight in Your Eyes', cover: STORYBOARD_COVER, date: '2026-07-30', status: 'Ready', liked: false, href: '/mv-storyboard' },
  { id: 'cinematic-night', type: 'Music Video', title: MUSIC_VIDEOS[0]?.title ?? 'Cinematic Night', cover: MUSIC_VIDEOS[0]?.cover ?? '', date: '2026-07-29', status: 'Done', liked: true, plays: 108, likes: 38, shares: 15, href: '/mv-result' },
  { id: 'generating-song', type: 'Song', title: 'Forest Morning', cover: '', date: '2026-07-28', status: 'Generating', liked: false, href: '/history' },
  { id: 'golden-hour', type: 'Song', title: SONGS[0]?.title ?? 'Golden Hour', cover: SONGS[0]?.cover ?? '', date: '2026-07-24', status: 'Done', liked: true, plays: 108, likes: 38, shares: 15, href: `/song-detail?id=${SONGS[0]?.id ?? ''}` },
  { id: 'failed-song', type: 'Song', title: 'Midnight Drive', cover: '', date: '2026-07-20', status: 'Failed', liked: false, href: '/song-create' },
  { id: 'neon-city', type: 'Song', title: SONGS[1]?.title ?? 'Neon City Nights', cover: SONGS[1]?.cover ?? '', date: '2026-07-18', status: 'Done', liked: true, plays: 94, likes: 31, shares: 12, href: `/song-detail?id=${SONGS[1]?.id ?? ''}` },
  { id: 'midnight-drive', type: 'Music Video', title: MUSIC_VIDEOS[1]?.title ?? 'Midnight Drive', cover: MUSIC_VIDEOS[1]?.cover ?? '', date: '2026-07-12', status: 'Done', liked: false, plays: 76, likes: 24, shares: 8, href: '/mv-result' },
  { id: 'morning-forest', type: 'Music Video', title: MUSIC_VIDEOS[2]?.title ?? 'Morning in the Forest', cover: MUSIC_VIDEOS[2]?.cover ?? '', date: '2026-07-08', status: 'Done', liked: true, plays: 68, likes: 21, shares: 6, href: '/mv-result' },
]

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function typeIcon(type: HistoryType) {
  if (type === 'Music Video') return icVideo
  if (type === 'Song') return icSong
  return icScript
}

function editLabel(type: HistoryType) {
  if (type === 'Music Video') return 'Edit MV'
  if (type === 'Song') return 'Edit Song'
  return 'Edit Storyboard'
}

function editHref(type: HistoryType) {
  if (type === 'Music Video') return '/mv-edit'
  if (type === 'Song') return '/song-create'
  return '/mv-storyboard'
}

function StatusBadge({ status }: { status: HistoryStatus }) {
  if (status === 'Ready') return null
  const icon = status === 'Done' ? icCheck : status === 'Failed' ? icAlert : icStar
  const label = status === 'Generating' ? 'Generating...' : status
  return (
    <span className={`history-card__status history-card__status--${status.toLowerCase()}`}>
      <span style={maskStyle(icon)} aria-hidden="true" />
      {label}
    </span>
  )
}

function SocialStat({ icon, value }: { icon: string; value: number }) {
  return (
    <span className="history-card__social-stat">
      <span style={maskStyle(icon)} aria-hidden="true" />
      {value}
    </span>
  )
}

interface HistoryCardProps {
  item: HistoryItem
  menuOpen: boolean
  liked: boolean
  published: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  onToggleLike: () => void
  onTogglePublish: () => void
  onCreateMv: () => void
}

function HistoryCard({
  item,
  menuOpen,
  liked,
  published,
  onToggleMenu,
  onCloseMenu,
  onToggleLike,
  onTogglePublish,
  onCreateMv,
}: HistoryCardProps) {
  const isComplete = item.status === 'Done'

  return (
    <article className={`history-card history-card--${item.status.toLowerCase()}`}>
      <a href={item.href} className={`history-card__cover history-card__cover--${item.type.toLowerCase().replaceAll(' ', '-')}`} aria-label={item.title}>
        {item.cover && <img src={item.cover} alt="" />}
        {isComplete && <span className="history-card__cover-scrim" aria-hidden="true" />}
        <div className="history-card__status-slot"><StatusBadge status={item.status} /></div>
        {item.status === 'Generating' && <span className="history-card__state-icon history-card__state-icon--generating" style={maskStyle(icTimer)} />}
        {item.status === 'Failed' && <span className="history-card__state-icon history-card__state-icon--failed" style={maskStyle(icAlert)} />}
        {item.status === 'Ready' && (
          <span className="history-card__create" onClick={(event) => { event.preventDefault(); onCreateMv() }}>
            <span style={maskStyle(icVideo)} aria-hidden="true" />
            Create MV
          </span>
        )}
        {isComplete && <span className="history-card__play"><span style={maskStyle(icPlay)} aria-hidden="true" /></span>}
        <span className="history-card__type-icon" style={maskStyle(typeIcon(item.type))} aria-hidden="true" />
      </a>

      <div className="history-card__info">
        <div className="history-card__copy">
          <a href={item.href}>{item.title}</a>
          {item.status === 'Generating' || item.status === 'Failed' || item.status === 'Ready' ? (
            <p>{item.type}</p>
          ) : (
            <div className="history-card__social">
              <SocialStat icon={icHeadphones} value={item.plays ?? 0} />
              <SocialStat icon={liked ? icFavoriteOn : icFavoriteOff} value={item.likes ?? 0} />
              <SocialStat icon={icShare} value={item.shares ?? 0} />
            </div>
          )}
          <time>{item.date}</time>
        </div>
        <div className="history-card__menu-shell">
          <button type="button" className="history-card__more" aria-label={`More actions for ${item.title}`} aria-expanded={menuOpen} onClick={onToggleMenu}>
            <span style={maskStyle(icMore)} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="history-card__menu" role="menu">
              <a href={editHref(item.type)} className="history-card__menu-primary" role="menuitem">
                <span style={maskStyle(icEdit)} aria-hidden="true" />
                {editLabel(item.type)}
              </a>
              <button type="button" role="menuitem" onClick={onToggleLike}>
                <span style={maskStyle(liked ? icFavoriteOn : icFavoriteOff)} aria-hidden="true" />
                {liked ? 'Unlike' : 'Like'}
              </button>
              <button type="button" role="menuitem" onClick={onCloseMenu}>
                <span style={maskStyle(icShare)} aria-hidden="true" />
                Share
              </button>
              <div className="history-card__menu-publish">
                <span><i style={maskStyle(icPublish)} aria-hidden="true" />Publish</span>
                <ToggleSwitch checked={published} onChange={onTogglePublish} />
              </div>
              <button type="button" role="menuitem" onClick={onCloseMenu}>
                <span style={maskStyle(icDownload)} aria-hidden="true" />
                Download
              </button>
              <button type="button" role="menuitem" className="history-card__menu-delete" onClick={onCloseMenu}>
                <span style={maskStyle(icDelete)} aria-hidden="true" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('All')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState(() => new Set(HISTORY_ITEMS.filter((item) => item.liked).map((item) => item.id)))
  const [publishedIds, setPublishedIds] = useState(() => new Set<string>())
  const { requireSignIn } = useAuth()

  useEffect(() => {
    if (!openMenuId) return
    function closeMenu(event: MouseEvent) {
      if (!(event.target as Element).closest('.history-card__menu-shell')) setOpenMenuId(null)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openMenuId])

  const visibleItems = HISTORY_ITEMS.filter((item) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Music Videos') return item.type === 'Music Video'
    if (activeTab === 'Songs') return item.type === 'Song'
    return likedIds.has(item.id)
  })

  function toggleSet(setter: Dispatch<SetStateAction<Set<string>>>, id: string) {
    setter((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AppLayout navbar={<RoomNavbar title="My Creations" credits={390} />}>
      <div className="history-page">
        <div className="history-page__tabs">
          <Tabs tabs={TABS} active={activeTab} onChange={(tab) => { setActiveTab(tab as HistoryTab); setOpenMenuId(null) }} />
        </div>
        <div className="history-page__grid">
          {visibleItems.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              menuOpen={openMenuId === item.id}
              liked={likedIds.has(item.id)}
              published={publishedIds.has(item.id)}
              onToggleMenu={() => setOpenMenuId((current) => current === item.id ? null : item.id)}
              onCloseMenu={() => setOpenMenuId(null)}
              onToggleLike={() => toggleSet(setLikedIds, item.id)}
              onTogglePublish={() => toggleSet(setPublishedIds, item.id)}
              onCreateMv={() => requireSignIn(() => { window.location.href = '/mv-edit' })}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

export default HistoryPage
