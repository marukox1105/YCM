import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { createPortal } from 'react-dom'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import Tabs from '../../components/Tabs/Tabs'
import TopSongListItem from '../../components/TopSongListItem/TopSongListItem'
import ShareDialog, { shareOrOpenDialog } from '../../components/ShareDialog/ShareDialog'
import LyricsSheet from '../../components/LyricsSheet/LyricsSheet'
import { SONGS } from '../../data/songs'
import { communityProfileHref } from '../../data/profile'
import icAccount from '../../assets/icons/ic_account.svg'
import icFavoriteOff from '../../assets/icons/ic_favorite_off.svg'
import icFavoriteOn from '../../assets/icons/ic_favorite_on.svg'
import icShare from '../../assets/icons/ic_share.svg'
import icSingingMic from '../../assets/icons/ic_singing_mic.svg'
import icSkipBack from '../../assets/icons/ic_skip_back.svg'
import icSkipForward from '../../assets/icons/ic_skip_forward.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPause from '../../assets/icons/ic_pause.svg'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import icArrowLeft from '../../assets/icons/ic_arrow_left.svg'
import icSpeakerOn from '../../assets/icons/ic_speaker_on.svg'
import icSpeakerOff from '../../assets/icons/ic_speaker_off.svg'
import icClose from '../../assets/icons/ic_close.svg'
import './SongDetailPage.css'

// Figma "Top Picks Songs — See All — Community_L" (nodes 1409:34847 at
// 1440, 1549:27425 at 1920). Real songs/covers now live in
// src/data/songs.ts — no fake mock data or fabricated creator names here.

const TABS = ['All', 'Top Picks', 'Trending', 'New Releases']

// No real per-tab data exists to actually filter by (Top Picks/Trending/New
// Releases aren't distinguished in the song data), so each tab just reorders
// the same catalog differently — enough to make switching tabs visibly do
// something, without fabricating category data that doesn't exist.
function sortForTab(tab: string): typeof SONGS {
  if (tab === 'Top Picks') return [...SONGS].reverse()
  if (tab === 'Trending') return [...SONGS].sort((a, b) => a.title.localeCompare(b.title))
  if (tab === 'New Releases') return [...SONGS].sort((a, b) => b.title.localeCompare(a.title))
  return SONGS
}

// Not official lyrics — each song's own generated lyrics from its
// title.json (see src/data/songs.ts), one per song rather than one shared
// placeholder string.
const FALLBACK_LYRICS = ['♪ No lyrics available for this one yet ♪']

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Figma "Song Player — Community" (node 120:1023, mobile-only) — below the
// app-mobile breakpoint, tapping a song in the list takes over the whole
// screen with this dedicated player. Desktop no longer has an inline Now
// Playing panel of its own — clicking a row there navigates straight to
// SongCreatePage's result-stage player instead (see selectSong below).
// Only one Figma frame was given for this mobile player, sized around a
// 320–375 phone — the upper end of this app's mobile range (up to 767px)
// scales the same layout proportionally rather than guessing a second
// breakpoint.
function MobileNowPlaying({
  song,
  onPrev,
  onNext,
  playing,
  currentTime,
  duration,
  audioRef,
  isOpen,
  onClose,
}: {
  song: (typeof SONGS)[number]
  onPrev: () => void
  onNext: () => void
  playing: boolean
  currentTime: number
  duration: number
  audioRef: RefObject<HTMLAudioElement | null>
  isOpen: boolean
  onClose: () => void
}) {
  const progressRef = useRef<HTMLDivElement>(null)
  const [liked, setLiked] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)

  const lyricLines = song.lyricLines.length ? song.lyricLines : FALLBACK_LYRICS

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
  }

  function seekFromClientX(clientX: number) {
    const track = progressRef.current
    const audio = audioRef.current
    if (!track || !audio || !audio.duration) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
  }

  function handleProgressPointerDown(event: ReactPointerEvent) {
    seekFromClientX(event.clientX)
    function handleMove(moveEvent: PointerEvent) {
      seekFromClientX(moveEvent.clientX)
    }
    function handleUp() {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const progressRatio = duration ? currentTime / duration : 0

  // Portalled to <body> — position:fixed here would otherwise be trapped
  // inside .app-layout__content's own stacking context (it sets z-index:1
  // on itself), so no z-index on this element could ever paint over
  // MobileHeader/MobileTabBar (z-index:20, siblings of .app-layout__content
  // rather than descendants). Same escape-hatch already used by
  // LoginModal/ShareDialog/LyricsSheet.
  return createPortal(
    <div className={`song-detail-mobile-player${isOpen ? ' song-detail-mobile-player--open' : ''}`}>
      <img src={song.cover} alt="" className="song-detail-mobile-player__bg" aria-hidden="true" />
      <div className="song-detail-mobile-player__scrim" aria-hidden="true" />

      <div className="song-detail-mobile-player__header">
        <button type="button" className="song-detail-mobile-player__back" onClick={onClose} aria-label="Back">
          <span className="song-detail-mobile-player__back-icon" style={maskStyle(icArrowLeft)} aria-hidden="true" />
        </button>
        <p className="song-detail-mobile-player__header-title">Now Playing</p>
        <span className="song-detail-mobile-player__header-spacer" aria-hidden="true" />
      </div>

      <div className="song-detail-mobile-player__art-wrap">
        <img
          src={song.cover}
          alt=""
          className={`song-detail-mobile-player__art${playing ? ' song-detail-mobile-player__art--spinning' : ''}`}
        />
      </div>

      <div className="song-detail-mobile-player__bottom">
        <div className="song-detail-mobile-player__meta-row">
          <div className="song-detail-mobile-player__meta">
            <p className="song-detail-mobile-player__title">{song.title}</p>
            {/* Same community-song convention as NowPlaying above — always
                that song's own creator, never the signed-in user. */}
            <button
              type="button"
              className="song-detail-mobile-player__user"
              onClick={() => (window.location.href = communityProfileHref(song.username))}
            >
              <span className="song-detail-mobile-player__avatar">
                <span className="song-detail-mobile-player__avatar-icon" style={maskStyle(icAccount)} aria-hidden="true" />
              </span>
              <span className="song-detail-mobile-player__username">{song.username}</span>
            </button>
          </div>

          <div className="song-detail-mobile-player__actions">
            <button
              type="button"
              className={`song-detail-mobile-player__icon-btn${liked ? ' song-detail-mobile-player__icon-btn--active' : ''}`}
              onClick={() => setLiked((current) => !current)}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <span
                className="song-detail-mobile-player__icon"
                style={maskStyle(liked ? icFavoriteOn : icFavoriteOff)}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              className="song-detail-mobile-player__icon-btn"
              onClick={() => shareOrOpenDialog(song.title, () => setShareOpen(true))}
              aria-label="Share"
            >
              <span className="song-detail-mobile-player__icon" style={maskStyle(icShare)} aria-hidden="true" />
            </button>
            <ShareDialog title={song.title} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
            <button
              type="button"
              className="song-detail-mobile-player__icon-btn"
              onClick={() => setShowLyrics(true)}
              aria-label="Show lyrics"
            >
              <span className="song-detail-mobile-player__icon" style={maskStyle(icSingingMic)} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className="song-detail-mobile-player__progress"
          ref={progressRef}
          onPointerDown={handleProgressPointerDown}
        >
          <div className="song-detail-mobile-player__progress-track" />
          <div className="song-detail-mobile-player__progress-fill" style={{ width: `${progressRatio * 100}%` }} />
          <div className="song-detail-mobile-player__progress-thumb" style={{ left: `${progressRatio * 100}%` }} />
        </div>
        <div className="song-detail-mobile-player__time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="song-detail-mobile-player__transport">
          <button
            type="button"
            className="song-detail-mobile-player__transport-btn"
            onClick={onPrev}
            aria-label="Previous"
          >
            <span className="song-detail-mobile-player__transport-icon" style={maskStyle(icSkipBack)} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="song-detail-mobile-player__play"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <span className="song-detail-mobile-player__play-icon" style={maskStyle(playing ? icPause : icPlay)} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="song-detail-mobile-player__transport-btn"
            onClick={onNext}
            aria-label="Next"
          >
            <span className="song-detail-mobile-player__transport-icon" style={maskStyle(icSkipForward)} aria-hidden="true" />
          </button>
        </div>

        <button type="button" className="song-detail-mobile-player__cta">
          Create AI Song
          <span className="song-detail-mobile-player__cta-icon" style={maskStyle(icArrowRight)} aria-hidden="true" />
        </button>
      </div>

      <LyricsSheet
        isOpen={showLyrics}
        title={song.title}
        cover={song.cover}
        lyricLines={lyricLines}
        currentTime={currentTime}
        duration={duration}
        playing={playing}
        onTogglePlay={togglePlay}
        onClose={() => setShowLyrics(false)}
      />
    </div>,
    document.body,
  )
}

function SongDetailPage() {
  const params = new URLSearchParams(window.location.search)
  const requestedId = params.get('id')
  const initialId = SONGS.some((song) => song.id === requestedId) ? requestedId! : SONGS[0].id
  const requestedTab = params.get('tab')
  const initialTab = TABS.includes(requestedTab ?? '') ? requestedTab! : TABS[0]
  const requestedSource = params.get('from')
  const source =
    requestedSource === 'song-create' || requestedSource === 'history' || requestedSource === 'community-profile'
      ? requestedSource
      : 'home'
  const backHref =
    source === 'song-create'
      ? '/song-create'
      : source === 'history'
        ? '/history'
        : source === 'community-profile'
          ? '/community-profile?tab=songs'
          : '/home'

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeId, setActiveId] = useState(initialId)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  // Mobile-only (<768px) — an explicit ?id= deep link opens straight into
  // the full-screen player (see MobileNowPlaying); otherwise mobile starts
  // on the list, same as desktop always shows both.
  const [mobilePlayerOpen, setMobilePlayerOpen] = useState(() => Boolean(requestedId))
  // Desktop-only narrow bottom playbar (see handleRowPlay) — lets browsing
  // continue while a preview keeps playing, without taking over the whole
  // page the way SongCreatePage's full result view or MobileNowPlaying do.
  const [barOpen, setBarOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [shareOpen, setShareOpen] = useState(false)
  // The bar must stay fixed to the viewport while scrolling (a transformed
  // ancestor would turn position:fixed into scrolling-away instead —
  // that's why this measures Sidebar's real rendered width via
  // ResizeObserver and offsets `left` by it, rather than constraining the
  // bar inside .app-layout__main via a containing-block trick). Sidebar's
  // width is a runtime toggle (collapsed/expanded), not a fixed breakpoint
  // value, so it can't just be hardcoded in CSS either.
  const [sidebarWidth, setSidebarWidth] = useState(0)

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar')
    if (!sidebar) return
    // contentRect excludes padding/border — Sidebar has both, so this reads
    // the actual rendered (border-box) width directly off the element
    // instead, matching what a `left` offset needs.
    const observer = new ResizeObserver((entries) => setSidebarWidth(entries[0].target.getBoundingClientRect().width))
    observer.observe(sidebar)
    return () => observer.disconnect()
  }, [])

  const displayedSongs = useMemo(() => sortForTab(activeTab), [activeTab])
  const activeIndex = displayedSongs.findIndex((song) => song.id === activeId)
  const activeSong = displayedSongs[activeIndex]

  // Loads + autoplays whenever the selected song changes (clicking a row,
  // or Prev/Next) — matches every other real <audio>/<video> element in
  // this project (e.g. HeroBannerSection), which all autoplay on change.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeSong) return
    audio.src = activeSong.audio
    audio.play()
  }, [activeSong])

  // The mobile player is reached by pushing a history entry (see
  // selectSong below) so the phone's native back gesture/button returns to
  // the list instead of leaving the page entirely — same convention as
  // CommunityProfilePage's tab-switch history.replaceState.
  useEffect(() => {
    function handlePopState() {
      setMobilePlayerOpen(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Mobile keeps taking over the screen in place (see MobileNowPlaying).
  // Desktop no longer has its own Now Playing column — clicking a row
  // navigates straight to SongCreatePage's result-stage player instead,
  // the same template/route History-origin results already reuse.
  function selectSong(songId: string) {
    if (!window.matchMedia('(max-width: 767px)').matches) {
      window.location.href = `/song-create?stage=result&id=${songId}&from=song-detail`
      return
    }
    setActiveId(songId)
    if (window.matchMedia('(max-width: 767px)').matches) {
      setMobilePlayerOpen(true)
      const query = source === 'home' ? `id=${songId}` : `id=${songId}&from=${source}`
      window.history.pushState({ songDetailPlayer: true }, '', `/song-detail?${query}`)
    }
  }

  function closeMobilePlayer() {
    window.history.back()
  }

  // Album-art play icon (as opposed to the title, which still navigates via
  // selectSong) — mobile keeps its existing full-screen takeover; desktop
  // starts/toggles the narrow bottom playbar in place instead.
  function handleRowPlay(songId: string) {
    if (window.matchMedia('(max-width: 767px)').matches) {
      selectSong(songId)
      return
    }
    if (songId === activeId) {
      togglePlay()
    } else {
      setActiveId(songId)
      setBarOpen(true)
    }
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  function toggleMute() {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }

  function handleVolumeChange(nextVolume: number) {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = nextVolume
    audio.muted = nextVolume === 0
    setVolume(nextVolume)
    setMuted(nextVolume === 0)
  }

  function closeBar() {
    audioRef.current?.pause()
    setBarOpen(false)
  }

  function seekFromClientX(clientX: number) {
    const track = progressRef.current
    const audio = audioRef.current
    if (!track || !audio || !audio.duration) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
  }

  function handleProgressPointerDown(event: ReactPointerEvent) {
    seekFromClientX(event.clientX)
    function handleMove(moveEvent: PointerEvent) {
      seekFromClientX(moveEvent.clientX)
    }
    function handleUp() {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  function goPrev() {
    const index = displayedSongs.findIndex((song) => song.id === activeId)
    const prevSong = displayedSongs[(index - 1 + displayedSongs.length) % displayedSongs.length]
    setActiveId(prevSong.id)
  }

  function goNext() {
    const index = displayedSongs.findIndex((song) => song.id === activeId)
    const nextSong = displayedSongs[(index + 1) % displayedSongs.length]
    setActiveId(nextSong.id)
  }

  const barProgressRatio = duration ? currentTime / duration : 0

  return (
    <AppLayout
      navbar={
        <DetailNavbar
          credits={390}
          backHref={backHref}
          mobileTitle="Top Picks Songs"
          tabsSlot={<Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />}
        />
      }
      showMobileHeader={false}
    >
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={goNext}
      />

      <div
        className={`song-detail${mobilePlayerOpen ? ' song-detail--mobile-player-open' : ''}`}
        // Keeps the last row(s) from sitting behind the fixed bottom
        // playbar once it's open — the bar's own height plus a little
        // breathing room, not just its bare content height.
        style={barOpen ? { paddingBottom: 96 } : undefined}
      >
        <div className="song-detail__list">
          {displayedSongs.map((song) => (
            <TopSongListItem
              key={song.id}
              title={song.title}
              username={song.username}
              plays={0}
              likes={0}
              shares={0}
              coverImage={song.cover}
              isPlaying={song.id === activeId && playing}
              onSelect={() => selectSong(song.id)}
              onPlay={() => handleRowPlay(song.id)}
            />
          ))}
        </div>
      </div>

      {/* Desktop-only narrow bottom playbar — starts from a row's album-art
          play icon (see handleRowPlay) rather than navigating away, so
          browsing the list can continue while a preview keeps playing. No
          Figma reference for this specific bar; laid out to match the
          existing MobileNowPlaying/NowPlaying transport row conventions. */}
      {barOpen && activeSong && (
        <div className="song-bar" style={{ left: sidebarWidth }}>
          <img src={activeSong.cover} alt="" className="song-bar__cover" />
          <div className="song-bar__meta">
            <p className="song-bar__title">{activeSong.title}</p>
            <p className="song-bar__username">{activeSong.username}</p>
          </div>

          <div className="song-bar__transport">
            <button type="button" className="song-bar__transport-btn" onClick={goPrev} aria-label="Previous">
              <span className="song-bar__transport-icon" style={maskStyle(icSkipBack)} aria-hidden="true" />
            </button>
            <button type="button" className="song-bar__play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              <span className="song-bar__play-icon" style={maskStyle(playing ? icPause : icPlay)} aria-hidden="true" />
            </button>
            <button type="button" className="song-bar__transport-btn" onClick={goNext} aria-label="Next">
              <span className="song-bar__transport-icon" style={maskStyle(icSkipForward)} aria-hidden="true" />
            </button>
          </div>

          <span className="song-bar__time">{formatTime(currentTime)}</span>
          <div className="song-bar__progress" ref={progressRef} onPointerDown={handleProgressPointerDown}>
            <div className="song-bar__progress-track" />
            <div className="song-bar__progress-fill" style={{ width: `${barProgressRatio * 100}%` }} />
            <div className="song-bar__progress-thumb" style={{ left: `${barProgressRatio * 100}%` }} />
          </div>
          <span className="song-bar__time">{formatTime(duration)}</span>

          <button
            type="button"
            className="song-bar__icon-btn"
            onClick={() => shareOrOpenDialog(activeSong.title, () => setShareOpen(true))}
            aria-label="Share"
          >
            <span className="song-bar__icon" style={maskStyle(icShare)} aria-hidden="true" />
          </button>
          <div className="song-bar__volume">
            <div className="song-bar__volume-slider">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                aria-label="Volume"
              />
            </div>
            <button type="button" className="song-bar__icon-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              <span
                className="song-bar__icon"
                style={maskStyle(muted || volume === 0 ? icSpeakerOff : icSpeakerOn)}
                aria-hidden="true"
              />
            </button>
          </div>
          <button type="button" className="song-bar__icon-btn" onClick={closeBar} aria-label="Close">
            <span className="song-bar__icon" style={maskStyle(icClose)} aria-hidden="true" />
          </button>

          <ShareDialog title={activeSong.title} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
        </div>
      )}

      <MobileNowPlaying
        song={activeSong}
        onPrev={goPrev}
        onNext={goNext}
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        audioRef={audioRef}
        isOpen={mobilePlayerOpen}
        onClose={closeMobilePlayer}
      />
    </AppLayout>
  )
}

export default SongDetailPage
