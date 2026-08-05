import AppLayout from '../../layouts/AppLayout/AppLayout'
import ToolSelectorSectionV3 from './ToolSelectorSectionV3'
import HeroBannerSectionV3 from './HeroBannerSectionV3'
import NewMVsSection from './NewMVsSection'
import TopPicksSection from './TopPicksSection'
import NewSongsSection from './NewSongsSection'
import './HomePage.css'

// Second A/B review page (see CLAUDE.md's A/B convention, and
// HomePageReviewB for the first proposal) — same Home sections as
// HomePage, except the tool cards move above the Hero Banner, gain a big
// heading ("What would you like to create today?"), and add a 3rd card
// (AI Storybooks) — see ToolSelectorSectionV3 — and the Hero Banner becomes
// a row of always-visible-info cards instead of one rotating carousel — see
// HeroBannerSectionV3. Temporary: fold the winning version back into the
// real HomePage once picked, then delete this page.
function HomePageReviewC() {
  return (
    <AppLayout showBackground showFooter showMobileTabBar>
      <div className="home-page">
        <ToolSelectorSectionV3 />
        <HeroBannerSectionV3 />
        <NewMVsSection />
        <TopPicksSection />
        <NewSongsSection />
      </div>
    </AppLayout>
  )
}

export default HomePageReviewC
