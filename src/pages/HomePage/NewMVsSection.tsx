import { useRef } from 'react'
import Card from '../../components/Card/Card'
import SectionHeader from '../../components/SectionHeader/SectionHeader'
import IconButton from '../../components/IconButton/IconButton'
import icArrowRight from '../../assets/icons/ic_arrow_right.svg'
import mv08 from '../../assets/covers/mv_08_dramatic_scene.png'
import mv09 from '../../assets/covers/mv_09_urban_performer.png'
import mv10 from '../../assets/covers/mv_10_monochrome.png'
import mv11 from '../../assets/covers/mv_11_halo.png'
import mv12 from '../../assets/covers/mv_12_Splash.png'
import mv13 from '../../assets/covers/mv_13_Urban Fashion.png'
import './NewMVsSection.css'

// Mock content — no API to call yet, this is UI-only per project scope.
// ids match the corresponding entries in MVDetailPage's own catalog, so a
// click here plays the right video on that page.
const NEW_MVS = [
  { id: 'mv-1', title: 'Dreamy Pastel', subtitle: 'Singing | 1-3 min', badge: 'HOT', image: mv08 },
  { id: 'mv-2', title: 'Cinematic Dark', subtitle: 'Storytelling | 2-3 min', badge: 'NEW', image: mv09 },
  { id: 'mv-3', title: 'Neon City', subtitle: 'Hybrid | 2-3 min', badge: 'HOT', image: mv10 },
  { id: 'mv-4', title: 'Nature & Earth', subtitle: 'Trending | 1-2 min', image: mv11 },
  { id: 'mv-6', title: 'Anime Style', subtitle: 'Fan fav | 1-2 min', image: mv12 },
  { id: 'mv-7', title: 'Rock & Roll', subtitle: 'Vintage | 2-3 min', image: mv13 },
]

function NewMVsSection() {
  const rowRef = useRef<HTMLDivElement>(null)

  function scrollNext() {
    rowRef.current?.scrollBy({ left: 220, behavior: 'smooth' })
  }

  return (
    <section className="new-mvs">
      <SectionHeader title="New Music Videos" seeAllHref="/mv-detail" />

      <div className="new-mvs__row-wrapper">
        <div className="new-mvs__row" ref={rowRef}>
          {NEW_MVS.map((mv) => (
            <a key={mv.id} href={`/mv-detail?id=${mv.id}`} className="new-mvs__item">
              <Card
                type="Video"
                ratio="3:4"
                title={mv.title}
                subtitle={mv.subtitle}
                badge={mv.badge}
                coverImage={mv.image}
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
