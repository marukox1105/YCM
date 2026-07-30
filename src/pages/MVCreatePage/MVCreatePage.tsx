import { useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import RoomNavbar from '../../components/RoomNavbar/RoomNavbar'
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch'
import ListItem from '../../components/ListItem/ListItem'
import { SONGS } from '../../data/songs'
import { MUSIC_VIDEOS } from '../../data/musicVideos'
import type { MvRatio } from '../../data/musicVideos'
import { saveMvDraft } from '../../data/mvDraft'
import type { MvDraft } from '../../data/mvDraft'
import icLightbulb from '../../assets/icons/ic_lightbulb.svg'
import icVideo from '../../assets/icons/ic_video.svg'
import icEditAi from '../../assets/icons/ic_edit_ai.svg'
import icClose from '../../assets/icons/ic_close.svg'
import icSongList from '../../assets/icons/ic_song_list.svg'
import icUpload from '../../assets/icons/ic_upload.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPause from '../../assets/icons/ic_pause.svg'
import icEdit from '../../assets/icons/ic_edit.svg'
import icAdd from '../../assets/icons/ic_add.svg'
import icChevronRight from '../../assets/icons/ic_chevron-right.svg'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import icClock from '../../assets/icons/ic_clock.svg'
import icCredit from '../../assets/icons/ic_credit.svg'
import icScript from '../../assets/icons/ic_script.svg'
import icVideoAi from '../../assets/icons/ic_video_ai.svg'
import icCheck from '../../assets/icons/ic_check.svg'
import icRefresh from '../../assets/icons/ic_refresh.svg'
import icRectangleVer from '../../assets/icons/ic_rectangle_ver.svg'
import icRectangleHor from '../../assets/icons/ic_rectangle_hor.svg'
import icSd from '../../assets/icons/ic_sd.svg'
import icHd from '../../assets/icons/ic_hd.svg'
import { useEnhance } from '../../hooks/useEnhance'
import sample1 from '../../assets/covers/Avatar/Sample_P1.png'
import sample2 from '../../assets/covers/Avatar/Sample_P2.png'
import sample3 from '../../assets/covers/Avatar/Sample_P3.png'
import sample4 from '../../assets/covers/Avatar/Sample_P4.png'
import sample5 from '../../assets/covers/Avatar/Sample_P5.png'
import sample6 from '../../assets/covers/Avatar/Sample_P6.png'
import sample7 from '../../assets/covers/Avatar/Sample_P7.png'
import sample8 from '../../assets/covers/Avatar/Sample_P8.png'
import styleVideoSinging from '../../assets/create-mv/type/feature_intro_ai_mv_singing_480x640.mp4?url'
import styleVideoStorytelling from '../../assets/create-mv/type/feature_intro_ai_mv_storytelling_480x640.mp4?url'
import styleVideoHybrid from '../../assets/create-mv/type/feature_intro_ai_mv_hybrid_480x640.mp4?url'
import './MVCreatePage.css'

// Figma "AI MV — Feature Room" (nodes 1330:24550, 1344:25723). Flow/behavior
// reference (song picker, photo upload, settings sheet, mode choice) is
// scottwu630/ycmuse-prototype muse-prototype-v1.html's #screen-mv-room +
// #settings-sheet + #mv-mode-sheet — no real AI/API call, per project scope.
//
// Scope for this pass: the Feature Room form itself, through to the "how
// would you like to create" mode choice. The reference HTML continues into
// a storyboard-review step and a render/result screen (#screen-mv-thinking,
// #screen-mv-storyboard, #screen-mv-creating, #screen-mv-result) — those
// aren't built yet, matching how Song Create's Processing/Result stages
// were added in later, separate passes rather than all at once.
//
// The reference HTML's face-detection picker (multi-face group photos,
// #fp-sheet) isn't in either Figma frame and only triggers for a specific
// edge case — simplified to plain single-photo selection instead.

type SongSource = 'library' | 'import' | null

interface ChosenSong {
  title: string
  cover: string
  audio: string
  duration: string
}

interface StyleOption {
  key: string
  label: string
  video: string
}

const MV_STYLES: StyleOption[] = [
  { key: 'singing', label: 'Singing', video: styleVideoSinging },
  { key: 'storytelling', label: 'Storytelling', video: styleVideoStorytelling },
  { key: 'hybrid', label: 'Hybrid', video: styleVideoHybrid },
]

const SAMPLE_PHOTOS = [sample1, sample2, sample3, sample4, sample5, sample6, sample7, sample8]

const IDEA_SUGGESTIONS = [
  'A cinematic story of two strangers who keep crossing paths in a neon-lit city, set to the rhythm of the song.',
  'An upbeat performance video in a sunlit studio, full of energy and movement that matches the beat.',
  'A dreamy narrative about chasing a memory through changing seasons.',
]

const ENHANCED_SUGGESTIONS = [
  'A slow-burn cinematic story: two strangers keep crossing paths under neon signs, the city breathing in time with the song, until a final glance says everything words couldn\'t.',
  'A sun-drenched performance piece — camera sweeping through a live studio session, energy building shot by shot until it explodes on the final chorus.',
]

// Reuses the same audio/cover catalog as Song Create/Song Detail — no
// fabricated song data. Figma "Choose Song" (node 297:5181) splits the
// picker into "My Songs"/"Sample Songs" tabs; this catalog has no such
// distinction of its own, so it's split arbitrarily in two to fill both tabs.
const MY_SONGS = SONGS.slice(0, 3)
const SAMPLE_SONGS = SONGS.slice(3, 8)

// Same MV catalog as Home/MV Detail — "My Creations" shows the user's own
// videos, so this reuses MUSIC_VIDEOS rather than SONGS despite the Figma
// mock text showing song-like titles (looks like reused placeholder copy
// from the Song page, not a deliberate content choice for this one).
const MY_CREATIONS = MUSIC_VIDEOS.slice(0, 7)

interface VideoTemplate {
  key: string
  label: string
  video: string
  ratio: MvRatio
  description: string
}

// Figma "Select a Template" (node 346:5071) shows 5 named style templates
// (J-Pop, Midnight Static, Paper Wonderland, Pastel Film, Alice in
// Wonderland — corrected from the Figma source's own "Wonderlnad" typo) each
// with their own preview VIDEO. No such per-template footage exists in this
// catalog, so this reuses MUSIC_VIDEOS' actual clips (and their real
// portrait/landscape `ratio`, so the preview never stretches/crops oddly)
// as stand-ins — flagged here, not a guess presented as final content.
const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    key: 'j-pop',
    label: 'J-Pop',
    video: MUSIC_VIDEOS[0]?.video ?? '',
    ratio: MUSIC_VIDEOS[0]?.ratio ?? '3:4',
    description: 'A vibrant J-Pop music video with neon stage lighting, dynamic camera moves, and high-energy choreography.',
  },
  {
    key: 'midnight-static',
    label: 'Midnight Static',
    video: MUSIC_VIDEOS[1]?.video ?? '',
    ratio: MUSIC_VIDEOS[1]?.ratio ?? '3:4',
    description: 'A moody, static-noise-drenched night scene with flickering lights and a melancholic atmosphere.',
  },
  {
    key: 'paper-wonderland',
    label: 'Paper Wonderland',
    video: MUSIC_VIDEOS[2]?.video ?? '',
    ratio: MUSIC_VIDEOS[2]?.ratio ?? '3:4',
    description: 'A whimsical paper-craft wonderland brought to life with soft pastel textures and gentle motion.',
  },
  {
    key: 'pastel-film',
    label: 'Pastel Film',
    video: MUSIC_VIDEOS[3]?.video ?? '',
    ratio: MUSIC_VIDEOS[3]?.ratio ?? '3:4',
    description: 'A dreamy pastel-toned film look with soft grain, warm light leaks, and a nostalgic indie feel.',
  },
  {
    key: 'alice-in-wonderland',
    label: 'Alice in Wonderland',
    video: MUSIC_VIDEOS[4]?.video ?? '',
    ratio: MUSIC_VIDEOS[4]?.ratio ?? '3:4',
    description: 'A surreal Wonderland-inspired story full of oversized props, curious characters, and vivid color.',
  },
]

// Figma "Trim Audio" (node 90:1452) waveform's own 45 bar heights, reused
// verbatim as mock waveform data (no real audio-analysis exists to derive
// real ones from).
const TRIM_WAVEFORM_HEIGHTS = [
  6, 16, 10, 26, 14, 36, 8, 28, 16, 38, 12, 32, 21, 42, 16, 34, 12, 26, 18, 22, 14, 18, 8, 20, 6, 16, 10, 26, 14, 36, 8,
  28, 16, 38, 12, 32, 21, 6, 16, 34, 12, 26, 18, 22, 14,
]
const TRIM_MIN_GAP = 0.08

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function songToChosen(song: (typeof SONGS)[number]): ChosenSong {
  return { title: song.title, cover: song.cover, audio: song.audio, duration: '' }
}

// Figma "Settings" (chip row, node 1330:25599) — chevron opens this sheet.
// Mobile bottom sheet / desktop centered dialog, same convention as
// LoginModal (no separate desktop frame was given for the sheet itself).
interface SettingsSheetProps {
  aspect: '9:16' | '16:9'
  onAspectChange: (value: '9:16' | '16:9') => void
  quality: 'SD' | 'HD'
  onQualityChange: (value: 'SD' | 'HD') => void
  mvTitle: string
  onMvTitleChange: (value: string) => void
  author: string
  onAuthorChange: (value: string) => void
  showSubtitle: boolean
  onShowSubtitleChange: (value: boolean) => void
  showWatermark: boolean
  onShowWatermarkChange: (value: boolean) => void
  onClose: () => void
}

function SettingsSheet({
  aspect,
  onAspectChange,
  quality,
  onQualityChange,
  mvTitle,
  onMvTitleChange,
  author,
  onAuthorChange,
  showSubtitle,
  onShowSubtitleChange,
  showWatermark,
  onShowWatermarkChange,
  onClose,
}: SettingsSheetProps) {
  return createPortal(
    <div className="mv-sheet-overlay">
      <div className="mv-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mv-sheet" role="dialog" aria-label="Settings">
        <div className="mv-sheet__handle" aria-hidden="true" />
        <div className="mv-sheet__header">
          <button type="button" className="mv-sheet__close" onClick={onClose} aria-label="Close">
            <img src={icClose} alt="" className="mv-sheet__close-icon" />
          </button>
          <p className="mv-sheet__title">Settings</p>
          <button type="button" className="mv-sheet__confirm" onClick={onClose} aria-label="Apply">
            <img src={icCheck} alt="" className="mv-sheet__confirm-icon" />
          </button>
        </div>

        <div className="mv-sheet__body">
          <div className="mv-settings__group">
            <p className="mv-settings__label">ASPECT RATIO</p>
            <div className="mv-settings__seg">
              <button
                type="button"
                className={`mv-settings__seg-opt${aspect === '9:16' ? ' mv-settings__seg-opt--active' : ''}`}
                onClick={() => onAspectChange('9:16')}
              >
                <span className="mv-settings__seg-icon" style={maskStyle(icRectangleVer)} aria-hidden="true" />
                9:16
              </button>
              <button
                type="button"
                className={`mv-settings__seg-opt${aspect === '16:9' ? ' mv-settings__seg-opt--active' : ''}`}
                onClick={() => onAspectChange('16:9')}
              >
                <span className="mv-settings__seg-icon" style={maskStyle(icRectangleHor)} aria-hidden="true" />
                16:9
              </button>
            </div>
          </div>

          <div className="mv-settings__group">
            <p className="mv-settings__label">QUALITY</p>
            <div className="mv-settings__seg">
              <button
                type="button"
                className={`mv-settings__seg-opt${quality === 'SD' ? ' mv-settings__seg-opt--active' : ''}`}
                onClick={() => onQualityChange('SD')}
              >
                <span className="mv-settings__seg-icon" style={maskStyle(icSd)} aria-hidden="true" />
                Standard
              </button>
              <button
                type="button"
                className={`mv-settings__seg-opt${quality === 'HD' ? ' mv-settings__seg-opt--active' : ''}`}
                onClick={() => onQualityChange('HD')}
              >
                <span className="mv-settings__seg-icon" style={maskStyle(icHd)} aria-hidden="true" />
                High
              </button>
            </div>
          </div>

          <div className="mv-settings__group">
            <p className="mv-settings__label">MV TITLE</p>
            <input
              type="text"
              className="mv-settings__input"
              placeholder="Enter MV song name"
              value={mvTitle}
              onChange={(e) => onMvTitleChange(e.target.value)}
            />
          </div>

          <div className="mv-settings__group">
            <p className="mv-settings__label">AUTHOR NAME</p>
            <input
              type="text"
              className="mv-settings__input"
              placeholder="Enter author name"
              value={author}
              onChange={(e) => onAuthorChange(e.target.value)}
            />
          </div>

          <div className="mv-settings__row">
            <div className="mv-settings__row-text">
              <p className="mv-settings__row-title">Show Subtitle</p>
              <p className="mv-settings__row-desc">Subtitles will appear in the video</p>
            </div>
            <ToggleSwitch checked={showSubtitle} onChange={onShowSubtitleChange} />
          </div>

          <div className="mv-settings__row">
            <div className="mv-settings__row-text">
              <p className="mv-settings__row-title">Show Watermark</p>
              <p className="mv-settings__row-desc">The YouCam Muse logo will appear.</p>
            </div>
            <ToggleSwitch checked={showWatermark} onChange={onShowWatermarkChange} />
          </div>
        </div>

        <div className="mv-sheet__footer">
          <button type="button" className="mv-sheet__footer-btn mv-sheet__footer-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="mv-sheet__footer-btn mv-sheet__footer-btn--confirm" onClick={onClose}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Figma "Choose Song" (node 297:5181, 297:4973) — My Songs/Sample Songs
// tabs; each row only reveals its "Use" pill once active (desktop: hovered,
// mobile: tapped — there's no hover on touch, so tapping the row itself
// stands in for it), instead of showing it permanently on every row.
// Clicking a row also actually plays that song's audio (one at a time via a
// single shared <audio> element) and swaps its thumbnail's icon to pause.
interface SongPickerSheetProps {
  onPick: (song: (typeof SONGS)[number]) => void
  onClose: () => void
}

function SongPickerSheet({ onPick, onClose }: SongPickerSheetProps) {
  const [tab, setTab] = useState<'my' | 'sample'>('my')
  const [activeSongId, setActiveSongId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const songs = tab === 'my' ? MY_SONGS : SAMPLE_SONGS

  function switchTab(next: 'my' | 'sample') {
    setTab(next)
    setActiveSongId(null)
    audioRef.current?.pause()
  }

  function handleRowClick(song: (typeof SONGS)[number]) {
    const audio = audioRef.current
    if (!audio) return
    if (activeSongId === song.id) {
      if (audio.paused) audio.play()
      else audio.pause()
    } else {
      setActiveSongId(song.id)
      audio.src = song.audio
      audio.play()
    }
  }

  return createPortal(
    <div className="mv-sheet-overlay">
      <div className="mv-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mv-sheet" role="dialog" aria-label="Choose Song">
        <div className="mv-sheet__handle" aria-hidden="true" />
        <div className="mv-sheet__header">
          <button type="button" className="mv-sheet__close" onClick={onClose} aria-label="Close">
            <img src={icClose} alt="" className="mv-sheet__close-icon" />
          </button>
          <p className="mv-sheet__title">Choose Song</p>
          <div className="mv-sheet__header-spacer" aria-hidden="true" />
        </div>

        <div className="mv-song-picker__tabs">
          <button
            type="button"
            className={`mv-song-picker__tab${tab === 'my' ? ' mv-song-picker__tab--active' : ''}`}
            onClick={() => switchTab('my')}
          >
            My Songs
          </button>
          <button
            type="button"
            className={`mv-song-picker__tab${tab === 'sample' ? ' mv-song-picker__tab--active' : ''}`}
            onClick={() => switchTab('sample')}
          >
            Sample Songs
          </button>
        </div>

        <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

        <div className="mv-sheet__body mv-sheet__body--list">
          {songs.map((song) => {
            const active = activeSongId === song.id
            return (
              <div
                key={song.id}
                className={`mv-song-picker__row${active ? ' mv-song-picker__row--active' : ''}`}
                onClick={() => handleRowClick(song)}
              >
                <span className="mv-song-picker__art">
                  <img src={song.cover} alt="" />
                  <span className="mv-song-picker__art-scrim" aria-hidden="true" />
                  <span
                    className="mv-song-picker__art-icon"
                    style={maskStyle(active && isPlaying ? icPause : icPlay)}
                    aria-hidden="true"
                  />
                </span>
                <span className="mv-song-picker__title">{song.title}</span>
                <button
                  type="button"
                  className="mv-song-picker__use"
                  onClick={(e) => {
                    e.stopPropagation()
                    audioRef.current?.pause()
                    onPick(song)
                  }}
                >
                  Use
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Figma "Select a Template" (node 346:5071) — mobile bottom sheet used
// directly; desktop reuses the same centered-dialog convention as the
// other sheets on this page (SongPickerSheet, SettingsSheet, ModeSheet),
// since Figma has no dedicated desktop frame for it either.
interface TemplateSheetProps {
  selectedKey: string
  onSelect: (key: string) => void
  onApply: () => void
  onClose: () => void
}

function TemplateSheet({ selectedKey, onSelect, onApply, onClose }: TemplateSheetProps) {
  const selected = VIDEO_TEMPLATES.find((template) => template.key === selectedKey) ?? VIDEO_TEMPLATES[0]

  return createPortal(
    <div className="mv-sheet-overlay">
      <div className="mv-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mv-sheet mv-template-sheet" role="dialog" aria-label="Select a Template">
        <div className="mv-sheet__handle" aria-hidden="true" />
        <div className="mv-sheet__header">
          <button type="button" className="mv-sheet__close" onClick={onClose} aria-label="Close">
            <img src={icClose} alt="" className="mv-sheet__close-icon" />
          </button>
          <p className="mv-sheet__title">Select a Template</p>
          <button type="button" className="mv-sheet__confirm" onClick={onApply} aria-label="Apply">
            <img src={icCheck} alt="" className="mv-sheet__confirm-icon" />
          </button>
        </div>

        <div
          className="mv-template-sheet__preview"
          style={{
            aspectRatio: selected.ratio === '3:4' ? '3 / 4' : '4 / 3',
            maxWidth: selected.ratio === '3:4' ? '200px' : '100%',
          }}
        >
          <video key={selected.key} src={selected.video} muted loop autoPlay playsInline />
        </div>

        <div className="mv-template-sheet__list">
          {VIDEO_TEMPLATES.map((template) => (
            <button
              key={template.key}
              type="button"
              className={`mv-template-sheet__item${template.key === selectedKey ? ' mv-template-sheet__item--active' : ''}`}
              onClick={() => onSelect(template.key)}
            >
              <video
                src={template.video}
                className="mv-template-sheet__thumb"
                muted
                loop
                autoPlay
                playsInline
              />
              <span className="mv-template-sheet__label">{template.label}</span>
            </button>
          ))}
        </div>

        <div className="mv-sheet__footer">
          <button type="button" className="mv-sheet__footer-btn mv-sheet__footer-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="mv-sheet__footer-btn mv-sheet__footer-btn--confirm" onClick={onApply}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Figma "Trim Audio" (node 90:1452) — opens after picking "Use" on a song in
// SongPickerSheet, mobile design used directly. Confirming here is what
// actually commits the song choice (no real audio-trimming exists, this is
// visual/interaction fidelity only — the drag handles move, but nothing is
// actually cut).
interface TrimAudioSheetProps {
  song: (typeof SONGS)[number]
  onConfirm: () => void
  onClose: () => void
}

function TrimAudioSheet({ song, onConfirm, onClose }: TrimAudioSheetProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0.2)
  const [trimEnd, setTrimEnd] = useState(0.75)
  const trimStartRef = useRef(trimStart)
  const trimEndRef = useRef(trimEnd)
  trimStartRef.current = trimStart
  trimEndRef.current = trimEnd

  function toggleSongPlay() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  function handleHandlePointerDown(edge: 'start' | 'end') {
    return (event: ReactPointerEvent) => {
      event.stopPropagation()

      function updateFromClientX(clientX: number) {
        const track = trackRef.current
        if (!track) return
        const rect = track.getBoundingClientRect()
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
        if (edge === 'start') {
          setTrimStart(Math.min(ratio, trimEndRef.current - TRIM_MIN_GAP))
        } else {
          setTrimEnd(Math.max(ratio, trimStartRef.current + TRIM_MIN_GAP))
        }
      }

      updateFromClientX(event.clientX)
      function handleMove(moveEvent: PointerEvent) {
        updateFromClientX(moveEvent.clientX)
      }
      function handleUp() {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
      }
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    }
  }

  return createPortal(
    <div className="mv-sheet-overlay">
      <div className="mv-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mv-sheet mv-trim-sheet" role="dialog" aria-label="Trim Audio">
        <div className="mv-sheet__handle" aria-hidden="true" />
        <div className="mv-sheet__header">
          <button type="button" className="mv-sheet__close" onClick={onClose} aria-label="Close">
            <img src={icClose} alt="" className="mv-sheet__close-icon" />
          </button>
          <p className="mv-sheet__title">Trim Audio</p>
          <button type="button" className="mv-sheet__confirm" onClick={onConfirm} aria-label="Confirm">
            <img src={icCheck} alt="" className="mv-sheet__confirm-icon" />
          </button>
        </div>

        <div className="mv-trim-sheet__intro">
          <p className="mv-trim-sheet__title">Trim Audio</p>
          <p className="mv-trim-sheet__desc">Only trim the audio to the parts you like the best.</p>
        </div>

        <audio
          ref={audioRef}
          src={song.audio}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />

        <div className="mv-trim-sheet__song">
          <button type="button" className="mv-trim-sheet__song-art" onClick={toggleSongPlay}>
            <img src={song.cover} alt="" />
            <span className="mv-trim-sheet__song-art-scrim" aria-hidden="true" />
            <span
              className="mv-trim-sheet__song-art-icon"
              style={maskStyle(playing ? icPause : icPlay)}
              aria-hidden="true"
            />
          </button>
          <div className="mv-trim-sheet__song-info">
            <p className="mv-trim-sheet__song-title">{song.title}</p>
            <p className="mv-trim-sheet__song-duration">{formatTime(duration)}</p>
          </div>
        </div>

        <div className="mv-trim-sheet__trimmer">
          <div className="mv-trim-sheet__time-row">
            <span>{formatTime(trimStart * duration)}</span>
            <span>{formatTime(trimEnd * duration)}</span>
          </div>
          <div className="mv-trim-sheet__waveform" ref={trackRef}>
            <div className="mv-trim-sheet__bars" aria-hidden="true">
              {TRIM_WAVEFORM_HEIGHTS.map((height, index) => (
                <span key={index} className="mv-trim-sheet__bar" style={{ height: `${height}px` }} />
              ))}
            </div>
            <div
              className="mv-trim-sheet__selection"
              style={{ left: `${trimStart * 100}%`, width: `${(trimEnd - trimStart) * 100}%` }}
              aria-hidden="true"
            />
            <button
              type="button"
              className="mv-trim-sheet__handle mv-trim-sheet__handle--start"
              style={{ left: `${trimStart * 100}%` }}
              onPointerDown={handleHandlePointerDown('start')}
              aria-label="Trim start"
            />
            <button
              type="button"
              className="mv-trim-sheet__handle mv-trim-sheet__handle--end"
              style={{ left: `${trimEnd * 100}%` }}
              onPointerDown={handleHandlePointerDown('end')}
              aria-label="Trim end"
            />
          </div>
        </div>

        <div className="mv-sheet__footer">
          <button type="button" className="mv-sheet__footer-btn mv-sheet__footer-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="mv-sheet__footer-btn mv-sheet__footer-btn--confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Figma "How Would You Like to Create" (node 53:53) — mobile frame used
// directly; desktop has no frame of its own, so this reuses the same
// centered-dialog convention as the other sheets on this page.
interface ModeSheetProps {
  draftBase: Omit<MvDraft, 'resultVideo'>
  onClose: () => void
}

function ModeSheet({ draftBase, onClose }: ModeSheetProps) {
  function pickMode() {
    const resultVideo = pickRandom(MUSIC_VIDEOS)
    saveMvDraft({
      ...draftBase,
      resultVideo: { title: resultVideo.title, cover: resultVideo.cover, video: resultVideo.video },
    })
  }

  function chooseStoryboard() {
    pickMode()
    window.location.href = '/mv-storyboard'
  }

  function chooseDirect() {
    // No processing/thinking screen for this path yet (see the note at the
    // top of this file) — goes straight to the same Result page the
    // Storyboard path ends up at.
    pickMode()
    window.location.href = '/mv-result'
  }

  return createPortal(
    <div className="mv-sheet-overlay">
      <div className="mv-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mv-sheet mv-mode-sheet" role="dialog" aria-label="How would you like to create?">
        <div className="mv-sheet__handle" aria-hidden="true" />
        <div className="mv-sheet__header">
          <button type="button" className="mv-sheet__close" onClick={onClose} aria-label="Close">
            <img src={icClose} alt="" className="mv-sheet__close-icon" />
          </button>
          <div className="mv-sheet__header-spacer" aria-hidden="true" />
          <div className="mv-mode-sheet__credit">
            <img src={icCredit} alt="" className="mv-mode-sheet__credit-icon" />
            <span>390</span>
          </div>
        </div>

        <div className="mv-mode-sheet__intro">
          <p className="mv-mode-sheet__headline">How would you like to create?</p>
          <p className="mv-mode-sheet__sub">Choose your creative workflow. You can always adjust later.</p>
        </div>

        <button type="button" className="mv-mode-card mv-mode-card--featured" onClick={chooseStoryboard}>
          <div className="mv-mode-card__top">
            <span className="mv-mode-card__icon" style={maskStyle(icScript)} aria-hidden="true" />
            <span className="mv-mode-card__badge">Recommended</span>
          </div>
          <p className="mv-mode-card__title">Create Storyboard First</p>
          <p className="mv-mode-card__desc">
            AI crafts a scene-by-scene storyboard for you to review and approve before rendering.
          </p>
          <div className="mv-mode-card__tags">
            <span className="mv-mode-card__tag">
              <img src={icClock} alt="" className="mv-mode-card__tag-icon" /> ~1 min
            </span>
            <span className="mv-mode-card__tag mv-mode-card__tag--credit">
              <img src={icCredit} alt="" className="mv-mode-card__tag-icon" /> 20 Credits
            </span>
          </div>
        </button>

        <button type="button" className="mv-mode-card" onClick={chooseDirect}>
          <div className="mv-mode-card__top">
            <span className="mv-mode-card__icon" style={maskStyle(icVideoAi)} aria-hidden="true" />
          </div>
          <p className="mv-mode-card__title">Create MV Directly</p>
          <p className="mv-mode-card__desc">AI generates your music video immediately. Fast and effortless.</p>
          <div className="mv-mode-card__tags">
            <span className="mv-mode-card__tag">
              <img src={icClock} alt="" className="mv-mode-card__tag-icon" /> ~2 min
            </span>
            <span className="mv-mode-card__tag mv-mode-card__tag--gold">
              <img src={icCredit} alt="" className="mv-mode-card__tag-icon" /> 200 Credits
            </span>
          </div>
        </button>
      </div>
    </div>,
    document.body,
  )
}

function MVCreatePage() {
  const [selectedStyle, setSelectedStyle] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const [song, setSong] = useState<ChosenSong | null>(null)
  const [songSource, setSongSource] = useState<SongSource>(null)
  const [songPlaying, setSongPlaying] = useState(false)
  const songAudioRef = useRef<HTMLAudioElement>(null)

  const [ideaText, setIdeaText] = useState('')
  const { isEnhancing, enhance } = useEnhance()

  const [photos, setPhotos] = useState<(string | null)[]>([null, null])
  const [photoNames, setPhotoNames] = useState<string[]>(['', ''])
  const [editingPhotoSlot, setEditingPhotoSlot] = useState<number | null>(null)
  const photoInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const importAudioInputRef = useRef<HTMLInputElement>(null)

  const [aspect, setAspect] = useState<'9:16' | '16:9'>('9:16')
  const [quality, setQuality] = useState<'SD' | 'HD'>('SD')
  const [mvTitle, setMvTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [showWatermark, setShowWatermark] = useState(false)

  const [songPickerOpen, setSongPickerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [modeSheetOpen, setModeSheetOpen] = useState(false)
  const [templateSheetOpen, setTemplateSheetOpen] = useState(false)
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(VIDEO_TEMPLATES[0].key)
  const [trimSong, setTrimSong] = useState<(typeof SONGS)[number] | null>(null)

  const canCreate = song !== null && ideaText.trim().length > 0

  function handlePickLibrarySong(picked: (typeof SONGS)[number]) {
    setSong(songToChosen(picked))
    setSongSource('library')
    setSongPickerOpen(false)
  }

  // Choose Song's "Use" doesn't commit the song directly — Figma routes it
  // through a Trim Audio step first (node 90:1452); only confirming there
  // actually picks the song.
  function handleUseSong(picked: (typeof SONGS)[number]) {
    setSongPickerOpen(false)
    setTrimSong(picked)
  }

  function confirmTrim() {
    if (trimSong) handlePickLibrarySong(trimSong)
    setTrimSong(null)
  }

  function applyTemplate() {
    const template = VIDEO_TEMPLATES.find((t) => t.key === selectedTemplateKey) ?? VIDEO_TEMPLATES[0]
    setIdeaText(template.description)
    setTemplateSheetOpen(false)
  }

  function handleImportAudioFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setSong({ title: file.name, cover: '', audio: URL.createObjectURL(file), duration: '' })
    setSongSource('import')
    event.target.value = ''
  }

  function clearSong() {
    setSong(null)
    setSongSource(null)
    setSongPlaying(false)
  }

  function toggleSongPlay() {
    const audio = songAudioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  function handlePhotoFile(slot: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotos((current) => current.map((p, i) => (i === slot ? URL.createObjectURL(file) : p)))
    setPhotoNames((current) => current.map((n, i) => (i === slot ? '' : n)))
    event.target.value = ''
  }

  function useSamplePhoto(slot: number, sample: string) {
    setPhotos((current) => current.map((p, i) => (i === slot ? sample : p)))
    setPhotoNames((current) => current.map((n, i) => (i === slot ? '' : n)))
  }

  function removePhoto(slot: number) {
    setPhotos((current) => current.map((p, i) => (i === slot ? null : p)))
    setPhotoNames((current) => current.map((n, i) => (i === slot ? '' : n)))
    setEditingPhotoSlot((current) => (current === slot ? null : current))
  }

  function setPhotoNameAt(slot: number, value: string) {
    setPhotoNames((current) => current.map((n, i) => (i === slot ? value : n)))
  }

  // Default static — only the hovered (desktop) or actively-pressed (mobile,
  // no hover) style card's preview clip plays, one at a time.
  function playStyleVideo(index: number) {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i === index) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else if (!video.paused) {
        video.pause()
        video.currentTime = 0
      }
    })
  }

  function stopStyleVideo(index: number) {
    const video = videoRefs.current[index]
    if (!video) return
    video.pause()
    video.currentTime = 0
  }

  return (
    <AppLayout navbar={<RoomNavbar title="AI Music Video" credits={390} />}>
      <div className="mv-create">
        <div className="mv-create__panel">
          <div className="mv-create__section">
            <p className="mv-create__label">SELECT MV TYPE</p>
            <div className="mv-create__styles">
              {MV_STYLES.map((style, index) => (
                <button
                  key={style.key}
                  type="button"
                  className={`mv-create__style-card${index === selectedStyle ? ' mv-create__style-card--active' : ''}`}
                  onClick={() => setSelectedStyle(index)}
                  onMouseEnter={() => playStyleVideo(index)}
                  onMouseLeave={() => stopStyleVideo(index)}
                  onTouchStart={() => playStyleVideo(index)}
                  onTouchEnd={() => stopStyleVideo(index)}
                  onTouchCancel={() => stopStyleVideo(index)}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el
                    }}
                    className="mv-create__style-video"
                    src={style.video}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                  />
                  <div className="mv-create__style-scrim" aria-hidden="true" />
                  <p className="mv-create__style-name">{style.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mv-create__section">
            <p className="mv-create__label">
              CHOOSE A SONG <span className="mv-create__label-optional">(Required)</span>
            </p>

            {!song ? (
              <div className="mv-create__song-options">
                <button type="button" className="mv-create__song-option" onClick={() => setSongPickerOpen(true)}>
                  <img src={icSongList} alt="" className="mv-create__song-option-icon" />
                  <span>Song Library</span>
                </button>
                <button
                  type="button"
                  className="mv-create__song-option"
                  onClick={() => importAudioInputRef.current?.click()}
                >
                  <img src={icUpload} alt="" className="mv-create__song-option-icon" />
                  <span>Import Audio</span>
                </button>
              </div>
            ) : (
              <div className="mv-create__song-added">
                <div className="mv-create__song-added-header">
                  <button
                    type="button"
                    className="mv-create__song-added-label"
                    onClick={() => setSongPickerOpen(true)}
                  >
                    {songSource === 'import' ? 'Imported Audio' : 'Song Library'}
                  </button>
                  <button type="button" className="mv-create__song-clear" onClick={clearSong} aria-label="Remove song">
                    <span className="mv-create__song-clear-icon" style={maskStyle(icClose)} aria-hidden="true" />
                  </button>
                </div>
                <div className="mv-create__song-divider" />
                <div className="mv-create__song-row">
                  <audio
                    ref={songAudioRef}
                    src={song.audio}
                    onPlay={() => setSongPlaying(true)}
                    onPause={() => setSongPlaying(false)}
                  />
                  <button type="button" className="mv-create__song-art" onClick={toggleSongPlay}>
                    {song.cover && <img src={song.cover} alt="" />}
                    <span className="mv-create__song-art-scrim" aria-hidden="true" />
                    <span
                      className="mv-create__song-art-icon"
                      style={maskStyle(songPlaying ? icPause : icPlay)}
                      aria-hidden="true"
                    />
                  </button>
                  <div className="mv-create__song-info">
                    <p className="mv-create__song-title">{song.title}</p>
                  </div>
                  <button
                    type="button"
                    className="mv-create__song-edit"
                    onClick={() => setSongPickerOpen(true)}
                    aria-label="Change song"
                  >
                    <span className="mv-create__song-edit-icon" style={maskStyle(icEdit)} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mv-create__section">
            <p className="mv-create__label">
              DESCRIBE YOUR VIDEO IDEA <span className="mv-create__label-optional">(Required)</span>
            </p>
            <div className={`mv-create__input-box${isEnhancing('idea') ? ' mv-create__input-box--processing' : ''}`}>
              <textarea
                className="mv-create__textarea"
                placeholder="Describe your video to help AI create a more compelling story."
                maxLength={2500}
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                disabled={isEnhancing('idea')}
              />
              <div className="mv-create__input-footer">
                <div className="mv-create__input-actions">
                  <button
                    type="button"
                    className="mv-create__idea-btn"
                    onClick={() => setTemplateSheetOpen(true)}
                    disabled={isEnhancing('idea')}
                  >
                    <span className="mv-create__idea-icon" style={maskStyle(icVideo)} aria-hidden="true" />
                    Templates
                  </button>
                  <button
                    type="button"
                    className="mv-create__idea-btn"
                    onClick={() => setIdeaText(pickRandom(IDEA_SUGGESTIONS))}
                    disabled={isEnhancing('idea')}
                  >
                    <span className="mv-create__idea-icon" style={maskStyle(icLightbulb)} aria-hidden="true" />
                    Idea
                  </button>
                </div>
                <div className="mv-create__footer-right">
                  {ideaText.length > 0 && (
                    <button
                      type="button"
                      className="mv-create__enhance-btn"
                      onClick={() => enhance('idea', () => setIdeaText(pickRandom(ENHANCED_SUGGESTIONS)))}
                      disabled={isEnhancing('idea')}
                      aria-label="Enhance"
                    >
                      <span
                        className={`mv-create__enhance-icon${isEnhancing('idea') ? ' mv-create__enhance-icon--spinning' : ''}`}
                        style={maskStyle(isEnhancing('idea') ? icRefresh : icEditAi)}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                  <span className="mv-create__char-count">{ideaText.length}/2500</span>
                  {ideaText.length > 0 && (
                    <button
                      type="button"
                      className="mv-create__clear-btn"
                      onClick={() => setIdeaText('')}
                      disabled={isEnhancing('idea')}
                      aria-label="Clear"
                    >
                      <span className="mv-create__clear-icon" style={maskStyle(icClose)} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mv-create__section">
            <p className="mv-create__label">UPLOAD CHARACTER PHOTO</p>
            <div className="mv-create__photos">
              {[0, 1].map((slot) => (
                <div key={slot} className="mv-create__photo-slot">
                  {photos[slot] ? (
                    <div className="mv-create__photo-filled">
                      <img src={photos[slot] ?? undefined} alt="" className="mv-create__photo-preview" />
                      <div className="mv-create__photo-top">
                        <button
                          type="button"
                          className="mv-create__photo-circle-btn"
                          onClick={() => removePhoto(slot)}
                          aria-label="Remove photo"
                        >
                          <span className="mv-create__photo-circle-icon" style={maskStyle(icClose)} aria-hidden="true" />
                        </button>
                      </div>
                      <div className="mv-create__photo-bottom">
                        {editingPhotoSlot === slot ? (
                          <input
                            type="text"
                            className="mv-create__photo-name-input"
                            placeholder="Name"
                            value={photoNames[slot]}
                            autoFocus
                            onChange={(e) => setPhotoNameAt(slot, e.target.value)}
                            onBlur={() => setEditingPhotoSlot(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingPhotoSlot(null)
                            }}
                          />
                        ) : (
                          <p className="mv-create__photo-name">{photoNames[slot] || 'Name'}</p>
                        )}
                        <button
                          type="button"
                          className="mv-create__photo-circle-btn"
                          onClick={() => setEditingPhotoSlot(slot)}
                          aria-label="Edit name"
                        >
                          <span className="mv-create__photo-circle-icon" style={maskStyle(icEdit)} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`mv-create__photo-add mv-create__photo-add--${slot === 0 ? 'primary' : 'tertiary'}`}
                      onClick={() => photoInputRefs[slot].current?.click()}
                    >
                      <span className="mv-create__photo-add-circle">
                        <span className="mv-create__photo-add-icon" style={maskStyle(icAdd)} aria-hidden="true" />
                      </span>
                      <span className="mv-create__photo-add-text">
                        {slot === 0 ? '1st face photo' : '2nd face photo'}
                        <br />
                        <span className="mv-create__photo-add-optional">(Optional)</span>
                      </span>
                    </button>
                  )}
                  <input
                    ref={photoInputRefs[slot]}
                    type="file"
                    accept="image/*"
                    className="mv-create__file-input"
                    onChange={(e) => handlePhotoFile(slot, e)}
                  />
                </div>
              ))}
            </div>
            <p className="mv-create__sample-label">Sample Photos</p>
            <div className="mv-create__samples">
              {SAMPLE_PHOTOS.map((sample, index) => (
                <button
                  key={index}
                  type="button"
                  className="mv-create__sample"
                  onClick={() => useSamplePhoto(photos[0] ? 1 : 0, sample)}
                >
                  <img src={sample} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="mv-create__section">
            <p className="mv-create__label">SETTINGS</p>
            <button type="button" className="mv-create__settings" onClick={() => setSettingsOpen(true)}>
              <div className="mv-create__settings-chips">
                <span className="mv-create__settings-chip">{aspect}</span>
                <span className="mv-create__settings-chip">{quality}</span>
                <span className={`mv-create__settings-chip${mvTitle ? '' : ' mv-create__settings-chip--dim'}`}>Title</span>
                <span className={`mv-create__settings-chip${authorName ? '' : ' mv-create__settings-chip--dim'}`}>Author</span>
                <span className={`mv-create__settings-chip${showSubtitle ? '' : ' mv-create__settings-chip--dim'}`}>Subtitle</span>
                <span className={`mv-create__settings-chip${showWatermark ? '' : ' mv-create__settings-chip--dim'}`}>Watermark</span>
              </div>
              <span className="mv-create__settings-chevron" style={maskStyle(icChevronRight)} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className={`mv-create__cta${canCreate ? ' mv-create__cta--active' : ''}`}
            disabled={!canCreate}
            onClick={() => setModeSheetOpen(true)}
          >
            <span>Create Music Video</span>
            <span className="mv-create__cta-icon" style={maskStyle(icArrowRight)} aria-hidden="true" />
          </button>
        </div>

        <div className="mv-create__side">
          <p className="mv-create__side-title">My Creations</p>
          <div className="mv-create__side-list">
            {MY_CREATIONS.map((mv) => (
              <a key={mv.id} href={`/mv-detail?id=${mv.id}`} className="mv-create__side-item">
                <ListItem title={mv.title} coverImage={mv.cover} username="ScottWu" plays={0} likes={mv.likes} shares={0} cta />
              </a>
            ))}
          </div>
        </div>
      </div>

      <input
        ref={importAudioInputRef}
        type="file"
        accept="audio/*"
        className="mv-create__file-input"
        onChange={handleImportAudioFile}
      />

      {songPickerOpen && <SongPickerSheet onPick={handleUseSong} onClose={() => setSongPickerOpen(false)} />}

      {trimSong && <TrimAudioSheet song={trimSong} onConfirm={confirmTrim} onClose={() => setTrimSong(null)} />}

      {templateSheetOpen && (
        <TemplateSheet
          selectedKey={selectedTemplateKey}
          onSelect={setSelectedTemplateKey}
          onApply={applyTemplate}
          onClose={() => setTemplateSheetOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsSheet
          aspect={aspect}
          onAspectChange={setAspect}
          quality={quality}
          onQualityChange={setQuality}
          mvTitle={mvTitle}
          onMvTitleChange={setMvTitle}
          author={authorName}
          onAuthorChange={setAuthorName}
          showSubtitle={showSubtitle}
          onShowSubtitleChange={setShowSubtitle}
          showWatermark={showWatermark}
          onShowWatermarkChange={setShowWatermark}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {modeSheetOpen && (
        <ModeSheet
          draftBase={{
            songTitle: song?.title ?? 'Down the Memory Lane',
            songCover: song?.cover || MUSIC_VIDEOS[0]?.cover || '',
            mvTitle: mvTitle || 'Starlight In Your Eyes',
            authorName: authorName || 'Isabella Rose Thompson',
            mvType: MV_STYLES[selectedStyle].label,
            aspect,
            quality,
            showSubtitle,
            showWatermark,
            characterPhoto: sample1,
          }}
          onClose={() => setModeSheetOpen(false)}
        />
      )}
    </AppLayout>
  )
}

export default MVCreatePage
