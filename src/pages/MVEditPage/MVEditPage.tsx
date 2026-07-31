import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import Button from '../../components/Button/Button'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import FloatingCTA from '../../components/FloatingCTA/FloatingCTA'
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch'
import { useAuth } from '../../components/AuthProvider/AuthProvider'
import { loadMvDraft, MOCK_SCENES } from '../../data/mvDraft'
import { STORYBOARD_CLIPS, STORYBOARD_COVER } from '../../data/storyboardClips'
import icEditAi from '../../assets/icons/ic_edit_ai.svg'
import icRefresh from '../../assets/icons/ic_refresh.svg'
import icExpand from '../../assets/icons/ic_expand.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPause from '../../assets/icons/ic_pause.svg'
import icDelete from '../../assets/icons/ic_delete.svg'
import icCredit from '../../assets/icons/ic_credit.svg'
import icDownload from '../../assets/icons/ic_download.svg'
import icSpeakerOn from '../../assets/icons/ic_speaker_on.svg'
import icSpeakerOff from '../../assets/icons/ic_speaker_off.svg'
import icClose from '../../assets/icons/ic_close.svg'
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
// Storyboard clip 1 is the generated cover image; clips 2–11 are the
// generated scene videos and matching thumbnails.

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function MVEditPage() {
  const { requireSignIn } = useAuth()
  const draft = loadMvDraft()
  const [selectedClip, setSelectedClip] = useState(0)
  const selectedStoryboardClip = STORYBOARD_CLIPS[selectedClip] ?? STORYBOARD_CLIPS[0]
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const [sceneTexts, setSceneTexts] = useState(() =>
    STORYBOARD_CLIPS.map((_, index) => MOCK_SCENES[index % MOCK_SCENES.length].text),
  )
  const [generatedSceneTexts, setGeneratedSceneTexts] = useState(() =>
    STORYBOARD_CLIPS.map((_, index) => MOCK_SCENES[index % MOCK_SCENES.length].text),
  )
  const [sceneVersions, setSceneVersions] = useState(() =>
    STORYBOARD_CLIPS.map((clip, index) => [clip.cover, STORYBOARD_CLIPS[(index + 1) % STORYBOARD_CLIPS.length].cover]),
  )
  const [selectedVersions, setSelectedVersions] = useState(() => STORYBOARD_CLIPS.map(() => 0))
  const sceneVersionsRef = useRef<HTMLDivElement>(null)
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

  function toggleMuted() {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setMuted(nextMuted)
  }

  function toggleFullscreen() {
    previewRef.current?.requestFullscreen?.().catch(() => {})
  }

  function recreateScene() {
    const nextVersion = selectedStoryboardClip.cover
    setSceneVersions((current) => {
      const next = current.map((versions, index) =>
        index === selectedClip ? [...versions, nextVersion] : versions,
      )
      setSelectedVersions((selected) =>
        selected.map((version, index) => (index === selectedClip ? next[selectedClip].length - 1 : version)),
      )
      return next
    })
    setGeneratedSceneTexts((current) =>
      current.map((text, index) => (index === selectedClip ? sceneTexts[selectedClip] : text)),
    )
  }

  const sceneText = sceneTexts[selectedClip] ?? ''
  const selectedVersion = selectedVersions[selectedClip] ?? 0
  const currentSceneVersions = sceneVersions[selectedClip] ?? []
  const canRecreateScene =
    sceneText.trim().length > 0 &&
    sceneText !== generatedSceneTexts[selectedClip] &&
    !isEnhancing('scene')
  const progressRatio = duration ? currentTime / duration : 0

  useEffect(() => {
    if (selectedVersion !== currentSceneVersions.length - 1) return
    sceneVersionsRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [currentSceneVersions.length, selectedVersion])

  return (
    <AppLayout navbar={<DetailNavbar title="Edit Music Video" credits={390} backHref="/mv-result" />}>
      <div className="mv-edit">
        <div className="mv-edit__panel">
          <div className="mv-edit__section">
            <p className="mv-edit__label">STORYBOARD</p>
            <p className="mv-edit__sublabel">Select to edit storyboard</p>

            <div className="mv-edit__clips-shell">
              <div className="mv-edit__clips">
                {STORYBOARD_CLIPS.map((clip, index) => (
                  <button
                    key={clip.id}
                    type="button"
                    className={`mv-edit__clip${index === selectedClip ? ' mv-edit__clip--active' : ''}`}
                    onClick={() => {
                      setSelectedClip(index)
                      setCurrentTime(0)
                    }}
                  >
                    <img src={clip.cover} alt="" />
                    <span className="mv-edit__clip-scrim" aria-hidden="true" />
                    <span className="mv-edit__clip-number">{index + 1}</span>
                  </button>
                ))}
              </div>
              <span className="mv-edit__clips-gradient" aria-hidden="true" />
            </div>

            <div ref={previewRef} className="mv-edit__preview">
              <video
                ref={videoRef}
                className="mv-edit__preview-video mv-edit__preview-video--portrait"
                src={selectedStoryboardClip.video}
                poster={selectedStoryboardClip.cover}
                autoPlay
                loop
                muted={muted}
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onClick={togglePlay}
              />
              <a
                href={selectedStoryboardClip.video}
                download
                className="mv-edit__media-action mv-edit__media-action--download"
                aria-label="Download video"
              >
                <span className="mv-edit__media-action-icon" style={maskStyle(icDownload)} aria-hidden="true" />
              </a>
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
                <button type="button" className="mv-edit__control-btn" onClick={toggleMuted} aria-label={muted ? 'Unmute' : 'Mute'}>
                  <span
                    className="mv-edit__control-icon"
                    style={maskStyle(muted ? icSpeakerOff : icSpeakerOn)}
                    aria-hidden="true"
                  />
                </button>
                <button type="button" className="mv-edit__control-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
                  <span className="mv-edit__control-icon" style={maskStyle(icExpand)} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="mv-edit__section">
            <div className="mv-edit__scene-header">
              <p className="mv-edit__scene-title">{MOCK_SCENES[selectedClip % MOCK_SCENES.length].title.toUpperCase()}</p>
              <p className="mv-edit__scene-time">{MOCK_SCENES[selectedClip % MOCK_SCENES.length].timestamp}</p>
            </div>
            <div className={`mv-edit__input-box${isEnhancing('scene') ? ' mv-edit__input-box--processing' : ''}`}>
              <textarea
                className="mv-edit__textarea"
                maxLength={2500}
                value={sceneText}
                onChange={(e) =>
                  setSceneTexts((current) =>
                    current.map((text, index) => (index === selectedClip ? e.target.value : text)),
                  )
                }
                disabled={isEnhancing('scene')}
              />
              <div className="mv-edit__input-footer">
                {sceneText.length > 0 && (
                  <button
                    type="button"
                    className="mv-edit__enhance-btn"
                    onClick={() =>
                      enhance('scene', () =>
                        setSceneTexts((current) =>
                          current.map((text, index) =>
                            index === selectedClip ? `${text} The light catches every detail.` : text,
                          ),
                        ),
                      )
                    }
                    disabled={isEnhancing('scene')}
                    aria-label="Enhance"
                  >
                    <span
                      className={`mv-edit__enhance-icon${isEnhancing('scene') ? ' mv-edit__enhance-icon--spinning' : ''}`}
                      style={maskStyle(isEnhancing('scene') ? icRefresh : icEditAi)}
                      aria-hidden="true"
                    />
                  </button>
                )}
                <span className="mv-edit__char-count">{sceneText.length}/2500</span>
                {sceneText.length > 0 && (
                  <button
                    type="button"
                    className="mv-edit__clear-btn"
                    onClick={() =>
                      setSceneTexts((current) =>
                        current.map((text, index) => (index === selectedClip ? '' : text)),
                      )
                    }
                    aria-label="Clear scene"
                  >
                    <span className="mv-edit__clear-icon" style={maskStyle(icClose)} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="mv-edit__divider" />
              <div className="mv-edit__scene-history">
                <div ref={sceneVersionsRef} className="mv-edit__scene-versions" aria-label="Generated scene history">
                  {currentSceneVersions.map((cover, index) => (
                    <button
                      key={`${cover}-${index}`}
                      type="button"
                      className={`mv-edit__scene-version${index === selectedVersion ? ' mv-edit__scene-version--active' : ''}`}
                      onClick={() =>
                        setSelectedVersions((current) =>
                          current.map((version, sceneIndex) => (sceneIndex === selectedClip ? index : version)),
                        )
                      }
                      aria-label={`Generated version ${index + 1}`}
                    >
                      <img src={cover} alt="" />
                    </button>
                  ))}
                </div>
                <Button
                  size="Large"
                  variant="PrimaryPayg"
                  creditsIcon={icCredit}
                  credits={20}
                  disabled={!canRecreateScene}
                  onClick={() => requireSignIn(recreateScene)}
                  className="mv-edit__recreate-scene"
                >
                  Recreate
                </Button>
              </div>
            </div>
          </div>

          <div className="mv-edit__ctas">
            <button type="button" className="mv-edit__delete-btn">
              <span className="mv-edit__delete-icon" style={maskStyle(icDelete)} aria-hidden="true" />
              Delete this Project
            </button>
          </div>
          <FloatingCTA alignToParent>
            <button
              type="button"
              className="mv-edit__merge-btn"
              onClick={() => requireSignIn(() => { window.location.href = '/mv-result' })}
            >
              <span>Merge MV</span>
              <span className="mv-edit__merge-credits">
                <img src={icCredit} alt="" />
                20
              </span>
            </button>
          </FloatingCTA>
        </div>

        <div className="mv-edit__side">
          <div className="mv-edit__section">
            <p className="mv-edit__label">COVER IMAGE</p>
            <div className="mv-edit__cover-image">
              <img
                src={STORYBOARD_COVER}
                alt=""
                className="mv-edit__cover-media mv-edit__cover-media--portrait"
              />
              <a
                href={STORYBOARD_COVER}
                download
                className="mv-edit__media-action mv-edit__media-action--download"
                aria-label="Download cover image"
              >
                <span className="mv-edit__media-action-icon" style={maskStyle(icDownload)} aria-hidden="true" />
              </a>
              <button type="button" className="mv-edit__media-action mv-edit__media-action--expand" aria-label="Expand cover image">
                <span className="mv-edit__media-action-icon" style={maskStyle(icExpand)} aria-hidden="true" />
              </button>
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
                {coverPrompt.length > 0 && (
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
                )}
                <span className="mv-edit__char-count">{coverPrompt.length}/2500</span>
                {coverPrompt.length > 0 && (
                  <button type="button" className="mv-edit__clear-btn" onClick={() => setCoverPrompt('')} aria-label="Clear cover prompt">
                    <span className="mv-edit__clear-icon" style={maskStyle(icClose)} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="mv-edit__divider" />
              <button
                type="button"
                className="mv-edit__regen-btn"
                disabled={coverPrompt.trim().length === 0}
                onClick={() => requireSignIn(() => {})}
              >
                <span className="mv-edit__regen-icon" style={maskStyle(icRefresh)} aria-hidden="true" />
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
              {mvTitle.length > 0 && (
                <button type="button" className="mv-edit__clear-btn" onClick={() => setMvTitle('')} aria-label="Clear MV title">
                  <span className="mv-edit__clear-icon" style={maskStyle(icClose)} aria-hidden="true" />
                </button>
              )}
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
              {authorName.length > 0 && (
                <button type="button" className="mv-edit__clear-btn" onClick={() => setAuthorName('')} aria-label="Clear author name">
                  <span className="mv-edit__clear-icon" style={maskStyle(icClose)} aria-hidden="true" />
                </button>
              )}
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
