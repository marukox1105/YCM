import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import { loadMvDraft, MOCK_LYRICS, MOCK_SCENES, MOCK_STORY, MOCK_VISUAL_STYLE } from '../../data/mvDraft'
import { SONGS } from '../../data/songs'
import icEdit from '../../assets/icons/ic_edit.svg'
import icEditAi from '../../assets/icons/ic_edit_ai.svg'
import icRefresh from '../../assets/icons/ic_refresh.svg'
import icChevronRight from '../../assets/icons/ic_chevron-right.svg'
import { useEnhance } from '../../hooks/useEnhance'
import icExpand from '../../assets/icons/ic_expand.svg'
import icPlay from '../../assets/icons/ic_play.svg'
import icPause from '../../assets/icons/ic_pause.svg'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import icScript from '../../assets/icons/ic_script.svg'
import './MVStoryboardPage.css'

// Figma "Edit Storyboard_L" (node 1344:26880). Flow/behavior reference is
// muse-prototype-v1.html's #screen-mv-storyboard — no real AI/API call, per
// project scope. Character image/song/lyrics come from the draft saved by
// MVCreatePage's mode-choice sheet (see src/data/mvDraft.ts); the 4 scenes
// and lyrics themselves are fixed mock content (Figma's own "Starlight In
// Your Eyes" mock), not derived from what the user actually typed.
//
// Visual Style/Story are shown as plain read-only cards (the edit pencil is
// decorative) — the reference HTML opens a full editor sheet for these, but
// Figma's own desktop frame just shows a static card with a pencil icon, no
// visible edit affordance beyond that. The 4 Scene cards ARE real editable
// textareas (Figma explicitly shows them as an Input Box with char count +
// Enhance), since that's the page's actual point: reviewing/adjusting the
// storyboard before rendering.

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

const STORYBOARD_PROCESSING_DURATION_MS = 3000

// Figma "Create Storyboard — Processing" (node 48:93), mobile design used
// directly; desktop reuses Song Create's Processing pattern (SongCreatePage
// .song-processing) of keeping this exact centered column and simply
// letting the page's two-column shell collapse to one full-width column
// while it's showing (see `.mv-storyboard--processing` in the stylesheet),
// rather than redesigning it into a side-by-side layout.
function MVStoryboardProcessing({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / STORYBOARD_PROCESSING_DURATION_MS) * 100)
      setProgress(pct)
      if (pct >= 100) {
        window.clearInterval(timer)
        onComplete()
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [onComplete])

  return (
    <div className="mv-storyboard-processing">
      <div className="mv-storyboard-processing__card">
        <span className="mv-storyboard-processing__icon" style={maskStyle(icScript)} aria-hidden="true" />
        <p className="mv-storyboard-processing__percent">{Math.round(progress)}%</p>
        <p className="mv-storyboard-processing__caption">Finalizing storyboard...</p>
      </div>

      <div className="mv-storyboard-processing__message">
        <p className="mv-storyboard-processing__title">Crafting Your Storyboard</p>
        <p className="mv-storyboard-processing__subtitle">
          AI is analyzing your audio and description to build the perfect cinematic sequence.
        </p>
      </div>

      <div className="mv-storyboard-processing__progress">
        <div className="mv-storyboard-processing__progress-track">
          <div className="mv-storyboard-processing__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="mv-storyboard-processing__eta-label">Estimated time remaining</p>
        <p className="mv-storyboard-processing__eta-value">~1 minute</p>
      </div>

      {/* No History page exists yet — same "#" stand-in Sidebar/Song
          Processing already use, not a guessed destination. */}
      <a href="#" className="mv-storyboard-processing__view-later">
        View Later
      </a>
    </div>
  )
}

function MVStoryboardPage() {
  const draft = loadMvDraft()
  const [stage, setStage] = useState<'processing' | 'edit'>('processing')
  // Imported-audio titles won't have a matching catalog entry — fall back
  // to the first song rather than leaving the preview silent.
  const songAudio = SONGS.find((song) => song.title === draft.songTitle)?.audio ?? SONGS[0]?.audio

  const [scenes, setScenes] = useState(MOCK_SCENES.map((scene) => scene.text))
  const { isEnhancing, enhance } = useEnhance()
  const [storylineExpanded, setStorylineExpanded] = useState(true)
  const [songPlaying, setSongPlaying] = useState(false)
  const songAudioRef = useRef<HTMLAudioElement>(null)

  function updateScene(index: number, value: string) {
    setScenes((current) => current.map((text, i) => (i === index ? value : text)))
  }

  function toggleSongPlay() {
    const audio = songAudioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  return (
    <AppLayout navbar={<DetailNavbar title="Edit Storyboard" credits={390} backHref="/mv-create" />}>
      <div className={`mv-storyboard${stage === 'processing' ? ' mv-storyboard--processing' : ''}`}>
        {stage === 'processing' ? (
          <MVStoryboardProcessing onComplete={() => setStage('edit')} />
        ) : (
          <>
        <div className="mv-storyboard__panel">
          <div className="mv-storyboard__section">
            <p className="mv-storyboard__label">VISUAL STYLE</p>
            <div className="mv-storyboard__display-card">
              <p className="mv-storyboard__display-text">{MOCK_VISUAL_STYLE}</p>
              <span className="mv-storyboard__display-edit" style={maskStyle(icEdit)} aria-hidden="true" />
            </div>
          </div>

          <div className="mv-storyboard__section">
            <p className="mv-storyboard__label">STORY</p>
            <div className="mv-storyboard__display-card mv-storyboard__display-card--flat">
              <p className="mv-storyboard__display-text mv-storyboard__display-text--muted">{MOCK_STORY}</p>
            </div>
          </div>

          <div className="mv-storyboard__section">
            <button
              type="button"
              className="mv-storyboard__storyline-header"
              onClick={() => setStorylineExpanded((current) => !current)}
            >
              <p className="mv-storyboard__label">STORY LINE</p>
              <span
                className={`mv-storyboard__storyline-chevron${storylineExpanded ? ' mv-storyboard__storyline-chevron--open' : ''}`}
                style={maskStyle(icChevronRight)}
                aria-hidden="true"
              />
            </button>

            {storylineExpanded && (
              <div className="mv-storyboard__scenes">
                {MOCK_SCENES.map((scene, index) => (
                  <div key={scene.title} className="mv-storyboard__scene">
                    <div className="mv-storyboard__scene-header">
                      <p className="mv-storyboard__scene-title">{scene.title}</p>
                      <p className="mv-storyboard__scene-time">{scene.timestamp}</p>
                    </div>
                    <div
                      className={`mv-storyboard__input-box${isEnhancing(`scene-${index}`) ? ' mv-storyboard__input-box--processing' : ''}`}
                    >
                      <textarea
                        className="mv-storyboard__textarea"
                        maxLength={2500}
                        value={scenes[index]}
                        onChange={(e) => updateScene(index, e.target.value)}
                        disabled={isEnhancing(`scene-${index}`)}
                      />
                      <div className="mv-storyboard__input-footer">
                        <span className="mv-storyboard__char-count">{scenes[index].length}/2500</span>
                        <button
                          type="button"
                          className="mv-storyboard__enhance-btn"
                          onClick={() =>
                            enhance(`scene-${index}`, () =>
                              updateScene(index, `${scenes[index]} The light catches every detail.`),
                            )
                          }
                          disabled={isEnhancing(`scene-${index}`)}
                          aria-label="Enhance"
                        >
                          <span
                            className={`mv-storyboard__enhance-icon${isEnhancing(`scene-${index}`) ? ' mv-storyboard__enhance-icon--spinning' : ''}`}
                            style={maskStyle(isEnhancing(`scene-${index}`) ? icRefresh : icEditAi)}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a href="/mv-result" className="mv-storyboard__cta">
            <span>Create MV</span>
            <span className="mv-storyboard__cta-icon" style={maskStyle(icArrowRight)} aria-hidden="true" />
          </a>
        </div>

        <div className="mv-storyboard__side">
          <div className="mv-storyboard__section">
            <p className="mv-storyboard__label">CHARACTER IMAGE</p>
            <div className="mv-storyboard__char-image">
              <img src={draft.characterPhoto} alt="" />
              <span className="mv-storyboard__char-expand" aria-hidden="true">
                <img src={icExpand} alt="" />
              </span>
            </div>
          </div>

          <div className="mv-storyboard__section">
            <p className="mv-storyboard__label">MV SONG</p>
            <div className="mv-storyboard__song">
              <audio
                ref={songAudioRef}
                src={songAudio}
                onPlay={() => setSongPlaying(true)}
                onPause={() => setSongPlaying(false)}
              />
              <button type="button" className="mv-storyboard__song-art" onClick={toggleSongPlay}>
                <img src={draft.songCover} alt="" />
                <span className="mv-storyboard__song-art-scrim" aria-hidden="true" />
                <span
                  className="mv-storyboard__song-art-icon"
                  style={maskStyle(songPlaying ? icPause : icPlay)}
                  aria-hidden="true"
                />
              </button>
              <p className="mv-storyboard__song-title">{draft.songTitle}</p>
            </div>
          </div>

          <div className="mv-storyboard__section">
            <p className="mv-storyboard__label">LYRICS</p>
            <div className="mv-storyboard__lyrics">
              {MOCK_LYRICS.map((line) => (
                <div key={line.time} className="mv-storyboard__lyrics-line">
                  <span className="mv-storyboard__lyrics-time">{line.time}</span>
                  <span className="mv-storyboard__lyrics-text">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default MVStoryboardPage
