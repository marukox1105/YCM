import icVideoAi from '../../assets/icons/ic_video_ai.svg'
import icSongAi from '../../assets/icons/ic_song_ai.svg'
import icStoryAi from '../../assets/icons/ic_story_ai.svg'
import './ToolSelectorSectionV3.css'

function maskStyle(src: string) {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

// A/B proposal #2 (see CLAUDE.md's A/B convention) — Figma "Tool Selector
// Section" (node 1875:34099): a big heading above 3 cards (adds AI
// Storybooks next to Music Video/Song), sitting above the Hero Banner like
// HomePageReviewB's ToolSelectorSectionAlt. See ToolSelectorSectionV3.css
// for why the hover treatment doesn't grow the card (Figma's own "Active"
// variants do, but that was confirmed not to be the intended behavior).
function ToolSelectorSectionV3() {
  return (
    <section className="tool-selector-v3">
      <h1 className="tool-selector-v3__heading">What would you like to create today?</h1>

      <div className="tool-selector-v3__row">
        <a href="/mv-create" className="tool-selector-v3__card tool-selector-v3__card--mv">
          <div className="tool-selector-v3__icon-badge tool-selector-v3__icon-badge--mv">
            <span className="tool-selector-v3__icon" style={maskStyle(icVideoAi)} aria-hidden="true" />
          </div>
          <div className="tool-selector-v3__text">
            <p className="tool-selector-v3__title">AI Music Video</p>
            <p className="tool-selector-v3__description">Upload a selfie and let AI create your music video.</p>
          </div>
        </a>

        <a href="/song-create" className="tool-selector-v3__card tool-selector-v3__card--song">
          <div className="tool-selector-v3__icon-badge tool-selector-v3__icon-badge--song">
            <span className="tool-selector-v3__icon" style={maskStyle(icSongAi)} aria-hidden="true" />
          </div>
          <div className="tool-selector-v3__text">
            <p className="tool-selector-v3__title">AI Song</p>
            <p className="tool-selector-v3__description">Write your lyrics or idea and let AI create the song.</p>
          </div>
        </a>

        {/* AI Storybook has no build creation flow yet (Sidebar's own "AI
            Storybook" nav item is also href="#" with a "NEW" badge) — kept
            consistent rather than pointing at MV Create as a stand-in. */}
        <a href="#" className="tool-selector-v3__card tool-selector-v3__card--story">
          <div className="tool-selector-v3__icon-badge tool-selector-v3__icon-badge--story">
            <span className="tool-selector-v3__icon" style={maskStyle(icStoryAi)} aria-hidden="true" />
          </div>
          <div className="tool-selector-v3__text">
            <p className="tool-selector-v3__title">AI Storybooks</p>
            <p className="tool-selector-v3__description">Turn your story into an AI audiobook or video.</p>
          </div>
        </a>
      </div>
    </section>
  )
}

export default ToolSelectorSectionV3
