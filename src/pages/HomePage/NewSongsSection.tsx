import ListItem from '../../components/ListItem/ListItem'
import SectionHeader from '../../components/SectionHeader/SectionHeader'
import { SONGS } from '../../data/songs'
import './NewSongsSection.css'

// Continues the real song catalog right where TopPicksSection's teaser (the
// first 6) leaves off, instead of separate placeholder mock data.
const NEXT_SONGS = SONGS.slice(6, 12)
const COLUMN_1 = NEXT_SONGS.slice(0, 3)
const COLUMN_2 = NEXT_SONGS.slice(3, 6)

// Same Song Detail page as Top Picks Songs, just landing on a different tab.
const SEE_ALL_HREF = `/song-detail?tab=${encodeURIComponent('New Releases')}`

function NewSongsSection() {
  return (
    <section className="new-songs">
      <SectionHeader title="Newly Released Songs" seeAllHref={SEE_ALL_HREF} />

      <div className="new-songs__layout">
        <div className="new-songs__column">
          {COLUMN_1.map((song) => (
            <a key={song.id} href={`/song-detail?id=${song.id}&tab=${encodeURIComponent('New Releases')}`} className="new-songs__item">
              <ListItem title={song.title} plays={0} likes={0} shares={0} coverImage={song.cover} />
            </a>
          ))}
        </div>
        <div className="new-songs__column">
          {COLUMN_2.map((song) => (
            <a key={song.id} href={`/song-detail?id=${song.id}&tab=${encodeURIComponent('New Releases')}`} className="new-songs__item">
              <ListItem title={song.title} plays={0} likes={0} shares={0} coverImage={song.cover} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewSongsSection
