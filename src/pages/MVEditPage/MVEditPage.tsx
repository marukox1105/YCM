import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch'
import { loadMvDraft, MOCK_SCENES } from '../../data/mvDraft'
import { MUSIC_VIDEOS } from '../../data/musicVideos'
import icEditAi from '../../assets/icons/ic_edit_ai.svg'
import icRefresh from '../../assets/icons/ic_refresh.svg'
import icExpand from '../../assets/icons/ic_expand.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPause from '../../assets/icons/ic_pause.svg'
import icDelete from '../../assets/icons/ic_delete.svg'
import icCredit from '../../assets/icons/ic_credit.svg'
import { useEnhance } from '../../hooks/useEnhance'
import './MVEditPage.css'

// Figma "Edit MV_L" (node 1351:28314), reached from the Result page's "Edit
// MV" quick action. Flow reference is muse-prototype-v1.html's
// #screen-mv-edit — no real AI/API call, per project scope.
//
// Figma's own "Show Watermark" toggle row appears twice with different
// states (On/Off) — a duplicated-node authoring slip, not two distinct
// settings — so this implements it as the single Show Subtitle + Show
// Watermark pair already used in MVCreatePage's Settings sheet instead of
// reproducing the duplicate literally.
//
// The 7 storyboard clip thumbnails reuse MUSIC_VIDEOS covers as stand-ins
// (no per-clip render exists) — same "flag it, don't guess" approach as
// MVCreatePage's style-card videos.

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const CLIPS = MUSIC_VIDEOS.slice(0, 7)

function MVEditPage() {
  const draft = loadMvDraft()

  const [selectedClip, setSelectedClip] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const [sceneText, setSceneText] = useState(MOCK_SCENES[0].text)
  const { isEnhancing, enhance } = useEnhance()

  const [coverPrompt, setCoverPrompt] = useState(
    `Create a captivating cover image for "${draft.mvTitle}" that embodies the essence of a dreamy night sky filled with shimmering stars.`,
  )
  const [mvTitle, setMvTitle] = useState(draft.mvTitle)
  const [authorName, setAuthorName] = useState(draft.authorName)
  const [showSubtitle, setShowSubtitle] = useState(draft.showSubtitle)
  const [showWatermark, setShowWatermark] = useState(draft.showWatermark)

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  function seekFromClientX(clientX: number) {
    const track = progressRef.current
    const video = videoRef.current
    if (!track || !video || !video.duration) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
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
    <AppLayout navbar={<DetailNavbar title="Edit Music Video" credits={390} backHref="/mv-result" />}>
      <div className="mv-edit">
        <div className="mv-edit__panel">
          <div className="mv-edit__section">
            <p className="mv-edit__label">STORYBOARD</p>
            <p className="mv-edit__sublabel">Select to edit storyboard</p>

            <div className="mv-edit__clips">
              {CLIPS.map((clip, index) => (
                <button
                  key={clip.id}
                  type="button"
                  className={`mv-edit__clip${index === selectedClip ? ' mv-edit__clip--active' : ''}`}
                  onClick={() => setSelectedClip(index)}
                >
                  <img src={clip.cover} alt="" />
                  <span className="mv-edit__clip-scrim" aria-hidden="true" />
                  <span className="mv-edit__clip-number">{index + 1}</span>
                </button>
              ))}
            </div>

            <div className="mv-edit__preview">
              <video
                ref={videoRef}
                className="mv-edit__preview-video"
                src={draft.resultVideo.video}
                poster={draft.resultVideo.cover}
                autoPlay
                loop
                muted
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onClick={togglePlay}
              />
              <div className="mv-edit__preview-controls">
                <button type="button" className="mv-edit__control-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                  <span className="mv-edit__control-icon" style={maskStyle(playing ? icPause : icPlay)} aria-hidden="true" />
                </button>
                <span className="mv-edit__time">{formatTime(currentTime)}</span>
                <div className="mv-edit__progress" ref={progressRef} onPointerDown={handleProgressPointerDown}>
                  <div className="mv-edit__progress-track" />
                  <div className="mv-edit__progress-fill" style={{ width: `${progressRatio * 100}%` }} />
                  <div className="mv-edit__progress-thumb" style={{ left: `${progressRatio * 100}%` }} />
                </div>
                <span className="mv-edit__time">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="mv-edit__section">
            <div className="mv-edit__scene-header">
              <p className="mv-edit__scene-title">{MOCK_SCENES[selectedClip % MOCK_SCENES.length].title}</p>
              <p className="mv-edit__scene-time">{MOCK_SCENES[selectedClip % MOCK_SCENES.length].timestamp}</p>
            </div>
            <div className={`mv-edit__input-box${isEnhancing('scene') ? ' mv-edit__input-box--processing' : ''}`}>
              <textarea
                className="mv-edit__textarea"
                maxLength={2500}
                value={sceneText}
                onChange={(e) => setSceneText(e.target.value)}
                disabled={isEnhancing('scene')}
              />
              <div className="mv-edit__input-footer">
                <span className="mv-edit__char-count">{sceneText.length}/2500</span>
                <button
                  type="button"
                  className="mv-edit__enhance-btn"
                  onClick={() => enhance('scene', () => setSceneText(`${sceneText} The light catches every detail.`))}
                  disabled={isEnhancing('scene')}
                  aria-label="Enhance"
                >
                  <span
                    className={`mv-edit__enhance-icon${isEnhancing('scene') ? ' mv-edit__enhance-icon--spinning' : ''}`}
                    style={maskStyle(isEnhancing('scene') ? icRefresh : icEditAi)}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="mv-edit__divider" />
              <button type="button" className="mv-edit__recreate-scene" disabled>
                <span>Recreate</span>
                <span className="mv-edit__recreate-credits">
                  <img src={icCredit} alt="" />
                  20
                </span>
              </button>
            </div>
          </div>

          <div className="mv-edit__ctas">
            <button type="button" className="mv-edit__delete-btn">
              <span className="mv-edit__delete-icon" style={maskStyle(icDelete)} aria-hidden="true" />
              Delete this Project
            </button>
            <button type="button" className="mv-edit__merge-btn">
              <span>Merge MV</span>
              <span className="mv-edit__merge-credits">
                <img src={icCredit} alt="" />
                20
              </span>
            </button>
          </div>
        </div>

        <div className="mv-edit__side">
          <div className="mv-edit__section">
            <p className="mv-edit__label">COVER IMAGE</p>
            <div className="mv-edit__cover-image">
              <img src={draft.characterPhoto} alt="" />
              <span className="mv-edit__cover-expand" aria-hidden="true">
                <img src={icExpand} alt="" />
              </span>
            </div>
            <div className={`mv-edit__input-box${isEnhancing('coverPrompt') ? ' mv-edit__input-box--processing' : ''}`}>
              <textarea
                className="mv-edit__textarea"
                maxLength={2500}
                value={coverPrompt}
                onChange={(e) => setCoverPrompt(e.target.value)}
                disabled={isEnhancing('coverPrompt')}
              />
              <div className="mv-edit__input-footer">
                <span className="mv-edit__char-count">{coverPrompt.length}/2500</span>
                <button
                  type="button"
                  className="mv-edit__enhance-btn"
                  onClick={() =>
                    enhance('coverPrompt', () => setCoverPrompt(`${coverPrompt} Rendered in soft cinematic light.`))
                  }
                  disabled={isEnhancing('coverPrompt')}
                  aria-label="Enhance"
                >
                  <span
                    className={`mv-edit__enhance-icon${isEnhancing('coverPrompt') ? ' mv-edit__enhance-icon--spinning' : ''}`}
                    style={maskStyle(isEnhancing('coverPrompt') ? icRefresh : icEditAi)}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="mv-edit__divider" />
              <button type="button" className="mv-edit__regen-btn">
                <img src={icEditAi} alt="" />
                <span>Recreate</span>
                <span className="mv-edit__regen-credits">
                  <img src={icCredit} alt="" />
                  10
                </span>
              </button>
            </div>
          </div>

          <div className="mv-edit__section">
            <p className="mv-edit__label">MV TITLE</p>
            <div className="mv-edit__field-box">
              <input type="text" className="mv-edit__field-input" value={mvTitle} onChange={(e) => setMvTitle(e.target.value)} />
            </div>
          </div>

          <div className="mv-edit__section">
            <p className="mv-edit__label">AUTHOR NAME</p>
            <div className="mv-edit__field-box">
              <input
                type="text"
                className="mv-edit__field-input"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
          </div>

          <div className="mv-edit__toggle-row">
            <div className="mv-edit__toggle-text">
              <p className="mv-edit__toggle-title">Show Subtitle</p>
              <p className="mv-edit__toggle-state">{showSubtitle ? 'On' : 'Off'}</p>
            </div>
            <ToggleSwitch checked={showSubtitle} onChange={setShowSubtitle} />
          </div>

          <div className="mv-edit__toggle-row">
            <div className="mv-edit__toggle-text">
              <p className="mv-edit__toggle-title">Show Watermark</p>
              <p className="mv-edit__toggle-state">{showWatermark ? 'On' : 'Off'}</p>
            </div>
            <ToggleSwitch checked={showWatermark} onChange={setShowWatermark} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default MVEditPage
