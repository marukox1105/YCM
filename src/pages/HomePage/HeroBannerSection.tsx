import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Button from '../../components/Button/Button'
import IconButton from '../../components/IconButton/IconButton'
import icStar from '../../assets/icons/ic_star.svg'
import icChevronLeft from '../../assets/icons/ic_chevron-left.svg'
import icChevronRight from '../../assets/icons/ic_chevron-right.svg'
import video01 from '../../assets/hero/hero_01_Vintage Car-tmp-tmp.mp4?url'
import thumb01 from '../../assets/hero/hero_01_Vintage Car.png'
import video02 from '../../assets/hero/hero_02_Splash-tmp-tmp.mp4?url'
import thumb02 from '../../assets/hero/hero_02_Splash.png'
import video03 from '../../assets/hero/hero_03_Urban Fashion-tmp-tmp.mp4?url'
import thumb03 from '../../assets/hero/hero_03_Urban Fashion.png'
import video04 from '../../assets/hero/hero_04_midnight_static-tmp-tmp.mp4?url'
import thumb04 from '../../assets/hero/hero_04_midnight_static.jpg'
import video05 from '../../assets/hero/hero_05_pastel_film_converted.mp4?url'
import thumb05 from '../../assets/hero/hero_05_pastel_film.jpg'
import video06 from '../../assets/hero/hero_06_alice_in_wonderland.mp4?url'
import thumb06 from '../../assets/hero/hero_06_alice_in_wonderland.jpg'
import video07 from '../../assets/hero/hero_07_jpop.mp4?url'
import thumb07 from '../../assets/hero/hero_07_jpop.jpg'
import video08 from '../../assets/hero/hero_08_paper_wonderland_converted.mp4?url'
import thumb08 from '../../assets/hero/hero_08_paper_wonderland.jpg'
import './HeroBannerSection.css'

// Mock content — no API to call yet, this is UI-only per project scope.
const HERO_ITEMS = [
  { title: 'Vintage Drive', subtitle: 'Retro | 2-3 min', video: video01, thumbnail: thumb01 },
  { title: 'Splash Zone', subtitle: 'Energetic | 2-3 min', video: video02, thumbnail: thumb02 },
  { title: 'Urban Runway', subtitle: 'Fashion | 2-3 min', video: video03, thumbnail: thumb03 },
  { title: 'Midnight Static', subtitle: 'Ambient | 3-4 min', video: video04, thumbnail: thumb04 },
  { title: 'Pastel Dreams', subtitle: 'Dreamy | 2-3 min', video: video05, thumbnail: thumb05 },
  { title: 'Wonderland Echoes', subtitle: 'Fantasy | 3-4 min', video: video06, thumbnail: thumb06 },
  { title: 'J-Pop Rush', subtitle: 'Pop | 2-3 min', video: video07, thumbnail: thumb07 },
  { title: 'Paper Wonderland', subtitle: 'Whimsical | 2-3 min', video: video08, thumbnail: thumb08 },
]

const ROTATE_INTERVAL_MS = 3000
const FADE_MS = 250

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

// Rendered 3x back-to-back so there's always more row to scroll toward in
// either direction — see the scroll-recentering effect below for how that
// becomes an endless-feeling loop instead of just extra padding.
const THUMBNAIL_COPIES = 3

function HeroBannerSection() {
  // `activeIndex` moves the thumbnail highlight immediately; `displayedIndex`
  // (what actually renders) waits for the fade-out before swapping, so the
  // banner crossfades instead of jumping straight to the next item.
  const [activeIndex, setActiveIndex] = useState(1)
  const [displayedIndex, setDisplayedIndex] = useState(1)
  const [isFading, setIsFading] = useState(false)
  const fadeTimeoutRef = useRef<number | undefined>(undefined)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  // setInterval's closure would otherwise see a stale activeIndex, since it's
  // only ever created once on mount.
  const activeIndexRef = useRef(activeIndex)

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  function goTo(index: number) {
    if (index === activeIndexRef.current) return
    setActiveIndex(index)
    setIsFading(true)
    window.clearTimeout(fadeTimeoutRef.current)
    fadeTimeoutRef.current = window.setTimeout(() => {
      setDisplayedIndex(index)
      setIsFading(false)
    }, FADE_MS)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((activeIndexRef.current + 1) % HERO_ITEMS.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => () => window.clearTimeout(fadeTimeoutRef.current), [])

  // Starts scrolled into the middle copy, so there's a full copy's worth of
  // room to scroll either direction before hitting a real edge.
  useEffect(() => {
    const row = thumbnailsRef.current
    if (!row) return
    row.scrollLeft = row.scrollWidth / THUMBNAIL_COPIES
  }, [])

  // Once the visible copy is scrolled (almost) out of view in either
  // direction, silently jump back by exactly one copy's width — since
  // every copy is identical, the jump is invisible and scrolling just
  // keeps going, which reads as an endless loop instead of a dead end.
  function handleThumbnailsScroll() {
    const row = thumbnailsRef.current
    if (!row) return
    const copyWidth = row.scrollWidth / THUMBNAIL_COPIES
    if (row.scrollLeft < copyWidth * 0.5) {
      row.scrollLeft += copyWidth
    } else if (row.scrollLeft > copyWidth * 1.5) {
      row.scrollLeft -= copyWidth
    }
  }

  function goPrev() {
    goTo((activeIndex - 1 + HERO_ITEMS.length) % HERO_ITEMS.length)
  }

  function goNext() {
    goTo((activeIndex + 1) % HERO_ITEMS.length)
  }

  const displayed = HERO_ITEMS[displayedIndex]

  return (
    <>
      <section className="hero-banner">
        <video
          key={displayed.video}
          className={`hero-banner__bg${isFading ? ' hero-banner__bg--fading' : ''}`}
          src={displayed.video}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-banner__scrim" aria-hidden="true" />

        <div className="hero-banner__top">
          <span className="hero-banner__badge">
            <span className="hero-banner__badge-icon" style={maskStyle(icStar)} aria-hidden="true" />
            Trending MV
          </span>

          <div className="hero-banner__text-cta">
            <div className={`hero-banner__title-group${isFading ? ' hero-banner__title-group--fading' : ''}`}>
              <p className="hero-banner__title">{displayed.title}</p>
              <p className="hero-banner__subtitle">{displayed.subtitle}</p>
            </div>

            <div className="hero-banner__action-row">
              <Button size="Large" variant="Secondary">
                Create Music Video
              </Button>
              <div className="hero-banner__arrows">
                <IconButton size="Medium" variant="Tertiary" icon={icChevronLeft} label="Previous" onClick={goPrev} />
                <IconButton size="Medium" variant="Tertiary" icon={icChevronRight} label="Next" onClick={goNext} />
              </div>
            </div>
          </div>
        </div>

        {/* Renders 3 identical copies back to back and silently re-centers
            the scroll position on scroll (see handleThumbnailsScroll) — the
            row always has more of itself to scroll toward in either
            direction, which reads as an endless loop instead of stopping
            at a real first/last item. */}
        <div className="hero-banner__thumbnails" ref={thumbnailsRef} onScroll={handleThumbnailsScroll}>
          {Array.from({ length: THUMBNAIL_COPIES }, (_, copy) =>
            HERO_ITEMS.map((item, index) => (
              <button
                key={`${copy}-${item.title}`}
                type="button"
                className={`hero-banner__thumb${index === activeIndex ? ' hero-banner__thumb--active' : ''}`}
                onClick={() => goTo(index)}
                aria-hidden={copy !== 1}
                tabIndex={copy === 1 ? 0 : -1}
              >
                {item.thumbnail && <img src={item.thumbnail} alt="" className="hero-banner__thumb-bg" />}
                <span className="hero-banner__thumb-scrim" aria-hidden="true" />
                <p className="hero-banner__thumb-title">{item.title}</p>
              </button>
            )),
          )}
        </div>
      </section>

      {/* App-mobile variant — Figma "Top Hero Banner" (node 369:7479), only
          shown below the app-mobile breakpoint; see AppLayout + layoutMode.ts.
          Reuses the same HERO_ITEMS as a swipeable peek-carousel of static
          cards instead of the video crossfade above. */}
      <div className="hero-banner-mobile">
        {HERO_ITEMS.map((item) => (
          <div className="hero-banner-mobile__card" key={item.title}>
            {item.thumbnail && <img src={item.thumbnail} alt="" className="hero-banner-mobile__bg" />}
            <div className="hero-banner-mobile__scrim" aria-hidden="true" />
            <span className="hero-banner-mobile__badge">
              <span className="hero-banner-mobile__badge-icon" style={maskStyle(icStar)} aria-hidden="true" />
              Trending MV
            </span>
            <div className="hero-banner-mobile__bottom">
              <div className="hero-banner-mobile__text">
                <p className="hero-banner-mobile__title">{item.title}</p>
                <p className="hero-banner-mobile__subtitle">{item.subtitle}</p>
              </div>
              <Button size="Small" variant="Secondary" className="hero-banner-mobile__cta">
                Create MV
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default HeroBannerSection
