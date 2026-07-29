import icVideoAi from '../../assets/icons/ic_video_ai.svg'
import icSongAi from '../../assets/icons/ic_song_ai.svg'
import './ToolSelectorSection.css'

function ToolSelectorSection() {
  return (
    <section className="tool-selector">
      <div className="tool-selector__card tool-selector__card--bright">
        <div className="tool-selector__icon-badge tool-selector__icon-badge--mv">
          <span className="tool-selector__icon" style={maskStyle(icVideoAi)} aria-hidden="true" />
        </div>
        <div className="tool-selector__text">
          <p className="tool-selector__title">Music Video Creator</p>
          <p className="tool-selector__description">
            Upload your selfie, choose a style, and watch AI craft a stunning music video in minutes.
          </p>
        </div>
      </div>

      <div className="tool-selector__card">
        <div className="tool-selector__icon-badge tool-selector__icon-badge--song">
          <span className="tool-selector__icon" style={maskStyle(icSongAi)} aria-hidden="true" />
        </div>
        <div className="tool-selector__text">
          <p className="tool-selector__title">AI Song Composer</p>
          <p className="tool-selector__description">
            Write your lyrics, pick a style, and AI generates a full song ready to share or use in your MV.
          </p>
        </div>
      </div>
    </section>
  )
}

function maskStyle(src: string) {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

export default ToolSelectorSection
