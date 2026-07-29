import { useRef } from 'react'
import Card from '../../components/Card/Card'
import SectionHeader from '../../components/SectionHeader/SectionHeader'
import IconButton from '../../components/IconButton/IconButton'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import { MUSIC_VIDEOS } from '../../data/musicVideos'
import './NewMVsSection.css'

// Same catalog as the MV Detail "See all" page (src/data/musicVideos.ts) —
// same ids/covers/videos, so clicking a card here plays the matching video
// there instead of an unrelated stand-in. All of them (not just a handful),
// so the row actually has more to reveal when the Next arrow is clicked.
const NEW_MVS = MUSIC_VIDEOS

// No real genre/duration data exists per video yet — decorative only.
const SUBTITLES = [
  'Storytelling | 2-3 min',
  'Cinematic | 2-3 min',
  'Hybrid | 2-3 min',
  'Trending | 1-2 min',
  'Fan fav | 1-2 min',
  'Vintage | 2-3 min',
]

function NewMVsSection() {
  const rowRef = useRef<HTMLDivElement>(null)

  function scrollNext() {
    rowRef.current?.scrollBy({ left: 220, behavior: 'smooth' })
  }

  return (
    <section className="new-mvs">
      <SectionHeader title="New Music Videos" mobileTitle="New MVs" seeAllHref="/mv-detail" />

      <div className="new-mvs__row-wrapper">
        <div className="new-mvs__row" ref={rowRef}>
          {NEW_MVS.map((mv, index) => (
            <a key={mv.id} href={`/mv-detail?id=${mv.id}`} className="new-mvs__item">
              <Card
                type="Video"
                ratio={mv.ratio}
                title={mv.title}
                subtitle={SUBTITLES[index % SUBTITLES.length]}
                badge={mv.badge}
                coverImage={mv.cover}
              />
            </a>
          ))}
        </div>

        <div className="new-mvs__next">
          <IconButton size="Large" variant="Ghost" icon={icArrowRight} label="Next" onClick={scrollNext} />
        </div>
      </div>
    </section>
  )
}

export default NewMVsSection
