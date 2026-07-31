import icVideoAi from '../../assets/icons/ic_video_ai.svg'
import icSongAi from '../../assets/icons/ic_song_ai.svg'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import IconButton from '../../components/IconButton/IconButton'
import './ToolSelectorSection.css'

function ToolSelectorSection() {
  const navigateTo = (href: string) => {
    window.location.href = href
  }

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
        <IconButton
          size="Medium"
          variant="Secondary"
          icon={icArrowRight}
          label="Create Music Video"
          className="tool-selector__action"
          onClick={() => navigateTo('/mv-create')}
        />
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
        <IconButton
          size="Medium"
          variant="Secondary"
          icon={icArrowRight}
          label="Create AI Song"
          className="tool-selector__action"
          onClick={() => navigateTo('/song-create')}
        />
      </div>
    </section>
  )
}

function maskStyle(src: string) {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

export default ToolSelectorSection
