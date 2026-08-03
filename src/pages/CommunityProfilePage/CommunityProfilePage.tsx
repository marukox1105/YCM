import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import Tabs from '../../components/Tabs/Tabs'
import IconButton from '../../components/IconButton/IconButton'
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch'
import ShareDialog, { shareOrOpenDialog } from '../../components/ShareDialog/ShareDialog'
import { MUSIC_VIDEOS } from '../../data/musicVideos'
import { SONGS } from '../../data/songs'
import avatar from '../../assets/covers/Avatar/Sample_P3.png'
import icVideo from '../../assets/icons/ic_video.svg'
import icSong from '../../assets/icons/ic_song.svg'
import icHeadphones from '../../assets/icons/ic_headphones.svg'
import icFavoriteOff from '../../assets/icons/ic_favorite_off.svg'
import icFavoriteOn from '../../assets/icons/ic_favorite_on.svg'
import icShare from '../../assets/icons/ic_share.svg'
import icMore from '../../assets/icons/ic_more.svg'
import icEdit from '../../assets/icons/ic_edit.svg'
import icPublish from '../../assets/icons/ic_publish.svg'
import icDownload from '../../assets/icons/ic_download.svg'
import icDelete from '../../assets/icons/ic_delete.svg'
import './CommunityProfilePage.css'

type ProfileTab = 'Music Videos' | 'Songs'

interface ProfileItem {
  id: string
  title: string
  cover: string
  href: string
  type: ProfileTab
}

const PROFILE_TABS: ProfileTab[] = ['Music Videos', 'Songs']

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

function toggleSet(setter: Dispatch<SetStateAction<Set<string>>>, id: string) {
  setter((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
}

function CommunityProfilePage() {
  const requestedTab = new URLSearchParams(window.location.search).get('tab')
  const [activeTab, setActiveTab] = useState<ProfileTab>(requestedTab === 'songs' ? 'Songs' : 'Music Videos')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState(() => new Set<string>())
  const [publishedIds, setPublishedIds] = useState(() => new Set<string>())
  const [shareItem, setShareItem] = useState<ProfileItem | null>(null)

  const items = useMemo<ProfileItem[]>(() => activeTab === 'Music Videos'
    ? MUSIC_VIDEOS.slice(0, 7).map((item) => ({ id: item.id, title: item.title, cover: item.cover, href: `/mv-detail?id=${item.id}`, type: 'Music Videos' }))
    : SONGS.slice(0, 7).map((item) => ({ id: item.id, title: item.title, cover: item.cover, href: `/song-detail?id=${item.id}`, type: 'Songs' })), [activeTab])

  useEffect(() => {
    if (!openMenuId) return
    function closeMenu(event: MouseEvent) {
      if (!(event.target as Element).closest('.community-profile__menu-shell')) setOpenMenuId(null)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openMenuId])

  function changeTab(tab: ProfileTab) {
    setActiveTab(tab)
    setOpenMenuId(null)
    window.history.replaceState(null, '', `/community-profile?tab=${tab === 'Songs' ? 'songs' : 'music-videos'}`)
  }

  return (
    <AppLayout navbar={<DetailNavbar credits={390} backHref="/account" />}>
      <section className="community-profile">
        <aside className="community-profile__summary">
          <div className="community-profile__identity">
            <img src={avatar} alt="Scott Wu" />
            <div><h1>Scott Wu</h1><p>scott_wu@mail.com</p></div>
          </div>
          <div className="community-profile__stats">
            <div><strong>1.2k</strong><span>Plays</span></div><i />
            <div><strong>472</strong><span>Likes</span></div>
          </div>
        </aside>

        <div className="community-profile__main">
          <Tabs tabs={PROFILE_TABS} active={activeTab} onChange={(tab) => changeTab(tab as ProfileTab)} />
          <div className="community-profile__list">
            {items.map((item) => {
              const liked = likedIds.has(item.id)
              const published = publishedIds.has(item.id)
              const menuOpen = openMenuId === item.id
              return (
                <article className="community-profile__item" key={item.id}>
                  <a className="community-profile__item-main" href={item.href}>
                    <span className="community-profile__cover">
                      <img src={item.cover} alt="" />
                      <span style={maskStyle(item.type === 'Music Videos' ? icVideo : icSong)} />
                    </span>
                    <span className="community-profile__copy">
                      <strong>{item.title}</strong>
                      <span className="community-profile__social">
                        <span><i style={maskStyle(icHeadphones)} />108</span>
                        <span><i style={maskStyle(icFavoriteOff)} />38</span>
                        <span><i style={maskStyle(icShare)} />15</span>
                      </span>
                      <time>2026-06-05</time>
                    </span>
                  </a>
                  <div className="community-profile__actions">
                    <IconButton size="Small" variant="Ghost" icon={liked ? icFavoriteOn : icFavoriteOff} label={liked ? 'Unlike' : 'Like'} onClick={() => toggleSet(setLikedIds, item.id)} />
                    <IconButton size="Small" variant="Ghost" icon={icShare} label="Share" onClick={() => shareOrOpenDialog(item.title, () => setShareItem(item))} />
                    <div className="community-profile__menu-shell">
                      <IconButton size="XSmall" variant="Tertiary" icon={icMore} label="More" onClick={() => setOpenMenuId((current) => current === item.id ? null : item.id)} />
                      {menuOpen && (
                        <div className="community-profile__menu" role="menu">
                          <a href={item.type === 'Music Videos' ? '/mv-edit' : '/song-create'} className="community-profile__menu-primary" role="menuitem"><span style={maskStyle(icEdit)} />{item.type === 'Music Videos' ? 'Edit MV' : 'Edit Song'}</a>
                          <button type="button" role="menuitem" onClick={() => toggleSet(setLikedIds, item.id)}><span style={maskStyle(liked ? icFavoriteOn : icFavoriteOff)} />{liked ? 'Unlike' : 'Like'}</button>
                          <button type="button" role="menuitem" onClick={() => { setOpenMenuId(null); shareOrOpenDialog(item.title, () => setShareItem(item)) }}><span style={maskStyle(icShare)} />Share</button>
                          <div className="community-profile__menu-publish"><span><i style={maskStyle(icPublish)} />Publish</span><ToggleSwitch checked={published} onChange={() => toggleSet(setPublishedIds, item.id)} /></div>
                          <button type="button" role="menuitem" onClick={() => setOpenMenuId(null)}><span style={maskStyle(icDownload)} />Download</button>
                          <button type="button" role="menuitem" className="community-profile__menu-delete" onClick={() => setOpenMenuId(null)}><span style={maskStyle(icDelete)} />Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
      <ShareDialog title={shareItem?.title ?? ''} isOpen={shareItem !== null} onClose={() => setShareItem(null)} />
    </AppLayout>
  )
}

export default CommunityProfilePage
