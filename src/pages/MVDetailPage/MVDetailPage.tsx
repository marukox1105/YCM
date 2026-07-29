import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import SectionHeader from '../../components/SectionHeader/SectionHeader'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import IconButton from '../../components/IconButton/IconButton'
import icAccount from '../../assets/icons/ic_account.svg'
import icFavoriteOff from '../../assets/icons/ic_favorite_off.svg'
import icFavoriteOn from '../../assets/icons/ic_favorite_on.svg'
import icShare from '../../assets/icons/ic_share.svg'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPause from '../../assets/icons/ic_pause.svg'
import icSpeakerOn from '../../assets/icons/ic_speaker_on.svg'
import icSpeakerOff from '../../assets/icons/ic_speaker_off.svg'
import icExpand from '../../assets/icons/ic_expand.svg'
import video01 from '../../assets/hero/hero_01_Vintage Car-tmp-tmp.mp4?url'
import video02 from '../../assets/hero/hero_02_Splash-tmp-tmp.mp4?url'
import video03 from '../../assets/hero/hero_03_Urban Fashion-tmp-tmp.mp4?url'
import video04 from '../../assets/hero/hero_04_midnight_static-tmp-tmp.mp4?url'
import video05 from '../../assets/hero/hero_05_pastel_film_converted.mp4?url'
import video06 from '../../assets/hero/hero_06_alice_in_wonderland.mp4?url'
import video07 from '../../assets/hero/hero_07_jpop.mp4?url'
import video08 from '../../assets/hero/hero_08_paper_wonderland_converted.mp4?url'
import mv01 from '../../assets/covers/mv_01_cinematic_dark.png'
import mv03 from '../../assets/covers/mv_03_neon_city.png'
import mv06 from '../../assets/covers/mv_06_cinematic_movie.png'
import mv07 from '../../assets/covers/mv_07_nature_earth.png'
import mv08 from '../../assets/covers/mv_08_dramatic_scene.png'
import mv09 from '../../assets/covers/mv_09_urban_performer.png'
import mv10 from '../../assets/covers/mv_10_monochrome.png'
import mv12 from '../../assets/covers/mv_12_Splash.png'
import mv13 from '../../assets/covers/mv_13_Urban Fashion.png'
import './MVDetailPage.css'

// Figma "New MVs — See All — Community_L_Portrait/Landscape" (nodes
// 1459:10288 / 1459:11202). No dedicated video file exists for this page's
// mock content yet, so each item reuses one of the Hero Banner's videos as a
// stand-in — see HeroBannerSection.tsx for the same asset set.
const MV_CATALOG = [
  { id: 'mv-1', title: 'Dreamy Pastel', username: 'StarryNights', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv08, video: video05 },
  { id: 'mv-2', title: 'Cinematic Dark', username: 'ChasingWaves', likes: 38, badge: undefined as string | undefined, ratio: '4:3', cover: mv09, video: video04 },
  { id: 'mv-3', title: 'Neon City', username: 'MysticRhythm', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv10, video: video02 },
  { id: 'mv-4', title: 'Nature & Earth', username: 'DreamyPastel', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv07, video: video06 },
  { id: 'mv-5', title: 'Neon City', username: 'ForestMorning', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv03, video: video07 },
  { id: 'mv-6', title: 'Anime Style', username: 'NeonCity', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv12, video: video08 },
  { id: 'mv-7', title: 'Rock & Roll', username: 'NatureAndEarth', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv13, video: video01 },
  { id: 'mv-8', title: 'Nature & Earth', username: 'MidnightDrive', likes: 38, badge: 'HOT', ratio: '4:3', cover: mv07, video: video03 },
  { id: 'mv-9', title: 'Dreamy Pastel', username: 'RockNRoll', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv06, video: video05 },
  { id: 'mv-10', title: 'Cinematic Dark', username: 'AnimeStyle', likes: 38, badge: 'HOT', ratio: '3:4', cover: mv01, video: video02 },
] as const

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function VideoPlayer({ item }: { item: (typeof MV_CATALOG)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  const [isPortrait, setIsPortrait] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [liked, setLiked] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  function handleLoadedMetadata() {
    const video = videoRef.current
    if (!video) return
    setIsPortrait(video.videoHeight > video.videoWidth)
    setDuration(video.duration)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      playerRef.current?.requestFullscreen()
    }
  }

  function seekFromClientX(clientX: number) {
    const track = progressRef.current
    const video = videoRef.current
    if (!track || !video || !video.duration) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
    setCurrentTime(video.currentTime)
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
    <div className="mv-player" ref={playerRef}>
      {isPortrait && (
        <video className="mv-player__backdrop" src={item.video} muted loop autoPlay playsInline aria-hidden="true" />
      )}
      <div className="mv-player__backdrop-scrim" aria-hidden="true" />

      <div className={`mv-player__stage${isPortrait ? ' mv-player__stage--portrait' : ''}`}>
        <video
          key={item.video}
          ref={videoRef}
          className="mv-player__video"
          src={item.video}
          autoPlay
          loop
          muted={muted}
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onClick={togglePlay}
        />
      </div>

      <div className="mv-player__floating">
        <div className="mv-player__meta-row">
          <div className="mv-player__meta">
            <p className="mv-player__title">{item.title}</p>
            <div className="mv-player__user">
              <span className="mv-player__avatar">
                <span className="mv-player__avatar-icon" style={maskStyle(icAccount)} aria-hidden="true" />
              </span>
              <span className="mv-player__username">{item.username}</span>
            </div>
          </div>

          <div className="mv-player__actions">
            <IconButton
              size="Medium"
              variant="Ghost"
              icon={liked ? icFavoriteOn : icFavoriteOff}
              label={liked ? 'Unlike' : 'Like'}
              onClick={() => setLiked((current) => !current)}
            />
            <IconButton size="Medium" variant="Ghost" icon={icShare} label="Share" />
            <Button size="Medium" variant="Primary" trailingIcon={icArrowRight} className="mv-player__cta">
              Create MV
            </Button>
          </div>
        </div>

        <div className="mv-player__controls">
          <button
            type="button"
            className="mv-player__control-btn"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <span className="mv-player__control-icon" style={maskStyle(playing ? icPause : icPlay)} aria-hidden="true" />
          </button>

          <div className="mv-player__progress" ref={progressRef} onPointerDown={handleProgressPointerDown}>
            <div className="mv-player__progress-track" />
            <div className="mv-player__progress-fill" style={{ width: `${progressRatio * 100}%` }} />
            <div className="mv-player__progress-thumb" style={{ left: `${progressRatio * 100}%` }} />
          </div>

          <span className="mv-player__time">{formatTime(currentTime)}</span>

          <button
            type="button"
            className="mv-player__control-btn"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            <span
              className="mv-player__control-icon"
              style={maskStyle(muted ? icSpeakerOff : icSpeakerOn)}
              aria-hidden="true"
            />
          </button>

          <button type="button" className="mv-player__control-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
            <span className="mv-player__control-icon" style={maskStyle(icExpand)} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MVDetailPage() {
  const params = new URLSearchParams(window.location.search)
  const selected = MV_CATALOG.find((mv) => mv.id === params.get('id'))

  return (
    <AppLayout navbar={<DetailNavbar credits={390} />}>
      <div className="mv-detail">
        {selected && <VideoPlayer item={selected} />}

        <section className="mv-detail__grid-section">
          <SectionHeader title="Newly Released Music Video" showSeeAll={false} />
          <div className="mv-detail__grid">
            {MV_CATALOG.map((mv) => (
              <a
                key={mv.id}
                href={`/mv-detail?id=${mv.id}`}
                className={`mv-detail__grid-item mv-detail__grid-item--${mv.ratio.replace(':', '-')}`}
              >
                <Card
                  type="Video"
                  ratio={mv.ratio}
                  community
                  title={mv.title}
                  username={mv.username}
                  likes={mv.likes}
                  badge={mv.badge}
                  coverImage={mv.cover}
                />
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default MVDetailPage
