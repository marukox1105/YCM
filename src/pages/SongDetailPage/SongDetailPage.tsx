import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import SectionHeader from '../../components/SectionHeader/SectionHeader'
import Tabs from '../../components/Tabs/Tabs'
import TopSongListItem from '../../components/TopSongListItem/TopSongListItem'
import ShareDialog, { shareOrOpenDialog } from '../../components/ShareDialog/ShareDialog'
import { SONGS } from '../../data/songs'
import icFavoriteOff from '../../assets/icons/ic_favorite_off.svg'
import icFavoriteOn from '../../assets/icons/ic_favorite_on.svg'
import icShare from '../../assets/icons/ic_share.svg'
import icSingingMic from '../../assets/icons/ic_singing_mic.svg'
import icSkipBack from '../../assets/icons/ic_skip_back.svg'
import icSkipForward from '../../assets/icons/ic_skip_forward.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPause from '../../assets/icons/ic_pause.svg'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
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

function NowPlaying({
  song,
  onPrev,
  onNext,
  playing,
  currentTime,
  duration,
  audioRef,
}: {
  song: (typeof SONGS)[number]
  onPrev: () => void
  onNext: () => void
  playing: boolean
  currentTime: number
  duration: number
  audioRef: RefObject<HTMLAudioElement | null>
}) {
  const progressRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLParagraphElement>(null)
  const [liked, setLiked] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const lyricLines = song.lyricLines.length ? song.lyricLines : FALLBACK_LYRICS
  // No per-line timestamps exist for generated lyrics, so this estimates
  // which line is "current" from how far through the song playback is —
  // close enough for the highlight to visibly track along as it plays.
  const activeLineIndex = Math.min(
    lyricLines.length - 1,
    Math.floor((duration ? currentTime / duration : 0) * lyricLines.length),
  )

  useEffect(() => {
    if (showLyrics) activeLineRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeLineIndex, showLyrics])

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

  return (
    <section className="now-playing">
      <SectionHeader title="Now Playing" showSeeAll={false} />

      <div className={`now-playing__art${showLyrics ? ' now-playing__art--lyrics-open' : ''}`}>
        {/* Hidden while lyrics are showing (on desktop especially) — the
            lyrics panel itself has no fill, so leaving this in place would
            just show through as a dimmed cover photo behind the text,
            which isn't what was wanted here. */}
        {!showLyrics && (
          <img
            src={song.cover}
            alt=""
            className={`now-playing__art-image${playing ? ' now-playing__art-image--spinning' : ''}`}
          />
        )}

        {/* Desktop (>=768px): replaces the cover directly, not constrained to
            the circle. Mobile (<768px): a popup instead, over a dimmed
            backdrop — position:fixed doesn't care about this nesting, it's
            relative to the viewport either way. No background fill on the
            panel itself — just the lyric lines, current one highlighted
            white, the rest dimmed. See SongDetailPage.css. */}
        {showLyrics && (
          <div className="now-playing__lyrics-overlay">
            <div className="now-playing__lyrics-backdrop" onClick={() => setShowLyrics(false)} aria-hidden="true" />
            <div className="now-playing__lyrics-panel">
              <button
                type="button"
                className="now-playing__lyrics-close"
                onClick={() => setShowLyrics(false)}
                aria-label="Close lyrics"
              >
                <span className="now-playing__lyrics-close-icon" aria-hidden="true">
                  ×
                </span>
              </button>
              <div className="now-playing__lyrics-lines">
                {lyricLines.map((line, index) => (
                  <p
                    key={index}
                    ref={index === activeLineIndex ? activeLineRef : undefined}
                    className={`now-playing__lyrics-line${index === activeLineIndex ? ' now-playing__lyrics-line--active' : ''}`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="now-playing__controller">
        <div className="now-playing__meta-row">
          <div className="now-playing__meta">
            <p className="now-playing__title">{song.title}</p>
          </div>

          <div className="now-playing__meta-actions">
            <button
              type="button"
              className="now-playing__icon-btn"
              onClick={() => setLiked((current) => !current)}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <span className="now-playing__icon" style={maskStyle(liked ? icFavoriteOn : icFavoriteOff)} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="now-playing__icon-btn"
              onClick={() => shareOrOpenDialog(song.title, () => setShareOpen(true))}
              aria-label="Share"
            >
              <span className="now-playing__icon" style={maskStyle(icShare)} aria-hidden="true" />
            </button>
            <ShareDialog title={song.title} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
            <button
              type="button"
              className={`now-playing__icon-btn${showLyrics ? ' now-playing__icon-btn--active' : ''}`}
              onClick={() => setShowLyrics((current) => !current)}
              aria-label={showLyrics ? 'Show cover art' : 'Show lyrics'}
            >
              <span className="now-playing__icon" style={maskStyle(icSingingMic)} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="now-playing__progress" ref={progressRef} onPointerDown={handleProgressPointerDown}>
          <div className="now-playing__progress-track" />
          <div className="now-playing__progress-fill" style={{ width: `${progressRatio * 100}%` }} />
          <div className="now-playing__progress-thumb" style={{ left: `${progressRatio * 100}%` }} />
        </div>
        <div className="now-playing__time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="now-playing__transport">
          <button type="button" className="now-playing__transport-btn" onClick={onPrev} aria-label="Previous">
            <span className="now-playing__transport-icon" style={maskStyle(icSkipBack)} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="now-playing__play"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <span className="now-playing__play-icon" style={maskStyle(playing ? icPause : icPlay)} aria-hidden="true" />
          </button>
          <button type="button" className="now-playing__transport-btn" onClick={onNext} aria-label="Next">
            <span className="now-playing__transport-icon" style={maskStyle(icSkipForward)} aria-hidden="true" />
          </button>
        </div>
      </div>

      <button type="button" className="now-playing__cta">
        Create AI Song
        <span className="now-playing__cta-icon" style={maskStyle(icArrowRight)} aria-hidden="true" />
      </button>
    </section>
  )
}

function SongDetailPage() {
  const params = new URLSearchParams(window.location.search)
  const requestedId = params.get('id')
  const initialId = SONGS.some((song) => song.id === requestedId) ? requestedId! : SONGS[0].id
  const requestedTab = params.get('tab')
  const initialTab = TABS.includes(requestedTab ?? '') ? requestedTab! : TABS[0]
  const requestedSource = params.get('from')
  const source = requestedSource === 'song-create' || requestedSource === 'history' ? requestedSource : 'home'
  const backHref = source === 'song-create' ? '/song-create' : source === 'history' ? '/history' : '/home'

  const audioRef = useRef<HTMLAudioElement>(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeId, setActiveId] = useState(initialId)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

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

  return (
    <AppLayout
      navbar={
        <DetailNavbar
          credits={390}
          backHref={backHref}
          tabsSlot={<Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />}
        />
      }
    >
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={goNext}
      />

      <div className="song-detail">
        <div className="song-detail__lists">
          <div className="song-detail__list">
            {displayedSongs.map((song) => (
              <TopSongListItem
                key={song.id}
                title={song.title}
                plays={0}
                likes={0}
                shares={0}
                coverImage={song.cover}
                isPlaying={song.id === activeId && playing}
                onSelect={() => setActiveId(song.id)}
              />
            ))}
          </div>
        </div>

        <NowPlaying
          song={activeSong}
          onPrev={goPrev}
          onNext={goNext}
          playing={playing}
          currentTime={currentTime}
          duration={duration}
          audioRef={audioRef}
        />
      </div>
    </AppLayout>
  )
}

export default SongDetailPage
