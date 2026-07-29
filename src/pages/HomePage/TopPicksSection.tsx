import { useRef, useState } from 'react'
import Card from '../../components/Card/Card'
import SectionHeader from '../../components/SectionHeader/SectionHeader'
import { SONGS } from '../../data/songs'
import './TopPicksSection.css'

// Home teaser — first 6 of the real song catalog (src/data/songs.ts).
// Clicking the play button plays the actual audio inline; clicking
// elsewhere on the card goes to the full Song Detail page.
const TOP_PICKS = SONGS.slice(0, 6)

function TopPicksSection() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  function handlePlayClick(id: string, src: string) {
    const audio = audioRef.current
    if (!audio) return

    if (playingId === id) {
      audio.pause()
      setPlayingId(null)
      return
    }

    audio.src = src
    audio.play()
    setPlayingId(id)
  }

  return (
    <section className="top-picks">
      <SectionHeader title="Top Picks Songs" seeAllHref="/song-detail" />

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      <div className="top-picks__row">
        {TOP_PICKS.map((song) => (
          <a key={song.id} href={`/song-detail?id=${song.id}`} className="top-picks__item">
            <Card
              type="Song"
              title={song.title}
              subtitle="AI Song"
              coverImage={song.cover}
              isPlaying={playingId === song.id}
              onPlayClick={() => handlePlayClick(song.id, song.audio)}
            />
          </a>
        ))}
      </div>
    </section>
  )
}

export default TopPicksSection
