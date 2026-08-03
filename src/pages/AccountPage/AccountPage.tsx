import { useState } from 'react'
import type { CSSProperties } from 'react'
import AppLayout from '../../layouts/AppLayout/AppLayout'
import RoomNavbar from '../../components/RoomNavbar/RoomNavbar'
import DetailNavbar from '../../components/DetailNavbar/DetailNavbar'
import Button from '../../components/Button/Button'
import IconButton from '../../components/IconButton/IconButton'
import { useAuth } from '../../components/AuthProvider/AuthProvider'
import icUser from '../../assets/icons/ic_user.svg'
import icEdit from '../../assets/icons/ic_edit.svg'
import icCamera from '../../assets/icons/ic_camera.svg'
import icClose from '../../assets/icons/ic_close.svg'
import icCredit from '../../assets/icons/ic_credit.svg'
import icCrown from '../../assets/icons/ic_crown.svg'
import icNotification from '../../assets/icons/ic_notification.svg'
import icLanguage from '../../assets/icons/ic_language.svg'
import icSend from '../../assets/icons/ic_send.svg'
import icSettings from '../../assets/icons/ic_settings.svg'
import icLogOut from '../../assets/icons/ic_log_out.svg'
import icChevronRight from '../../assets/icons/ic_chevron-right.svg'
import icFileText from '../../assets/icons/ic_file_text.svg'
import icShieldCheck from '../../assets/icons/ic_shield_check.svg'
import icCalendarX from '../../assets/icons/ic_calendar_x.svg'
import icUserX from '../../assets/icons/ic_user_x.svg'
import './AccountPage.css'

type DialogType = 'edit' | 'signout' | 'delete' | null

function maskStyle(src: string): CSSProperties {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

interface AccountRowProps {
  icon: string
  title: string
  subtitle?: string
  href?: string
  onClick?: () => void
}

function AccountRow({ icon, title, subtitle, href, onClick }: AccountRowProps) {
  const content = (
    <>
      <span className="account-page__row-icon-box">
        <span className="account-page__row-icon" style={maskStyle(icon)} aria-hidden="true" />
      </span>
      <span className="account-page__row-copy">
        <span className="account-page__row-title">{title}</span>
        {subtitle && <span className="account-page__row-subtitle">{subtitle}</span>}
      </span>
      <span className="account-page__row-chevron" style={maskStyle(icChevronRight)} aria-hidden="true" />
    </>
  )

  return href ? (
    <a className="account-page__row" href={href}>{content}</a>
  ) : (
    <button type="button" className="account-page__row" onClick={onClick}>{content}</button>
  )
}

function ConfirmDialog({ type, onCancel, onConfirm }: { type: 'signout' | 'delete'; onCancel: () => void; onConfirm: () => void }) {
  const deleting = type === 'delete'
  return (
    <div className="account-dialog-layer" role="presentation" onMouseDown={onCancel}>
      <section className="account-confirm" role="dialog" aria-modal="true" aria-labelledby="account-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="account-confirm__message">
          <h2 id="account-confirm-title">{deleting ? 'Delete Account' : 'Sign Out'}</h2>
          <p>{deleting
            ? 'All your MVs, songs, and credits will be permanently lost and cannot be recovered. Please cancel any active subscriptions before deleting your account.'
            : 'Are you sure you want to sign out of your account?'}</p>
        </div>
        <div className="account-confirm__actions">
          <Button size="Small" variant="Tertiary" onClick={onCancel}>Cancel</Button>
          <Button size="Small" variant={deleting ? 'Primary' : 'Secondary'} className={deleting ? 'account-confirm__delete' : ''} onClick={onConfirm}>
            {deleting ? 'Delete' : 'Sign Out'}
          </Button>
        </div>
      </section>
    </div>
  )
}

function EditProfileDialog({ onClose }: { onClose: () => void }) {
  const [nickname, setNickname] = useState('Scott Wu')
  return (
    <div className="account-dialog-layer" role="presentation" onMouseDown={onClose}>
      <section className="account-edit" role="dialog" aria-modal="true" aria-labelledby="account-edit-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="account-edit__header">
          <span aria-hidden="true" />
          <h2 id="account-edit-title">Edit Profile</h2>
          <IconButton size="XSmall" variant="Tertiary" icon={icClose} label="Close" onClick={onClose} />
        </header>
        <div className="account-edit__avatar-area">
          <span className="account-page__avatar account-edit__avatar">
            <span style={maskStyle(icUser)} aria-hidden="true" />
            <span className="account-edit__camera"><span style={maskStyle(icCamera)} /></span>
          </span>
          <button type="button" className="account-edit__change-photo">Change Photo</button>
        </div>
        <label className="account-edit__field">
          <span>Nickname</span>
          <span className="account-edit__input-wrap">
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
            {nickname && <button type="button" aria-label="Clear nickname" onClick={() => setNickname('')}><span style={maskStyle(icClose)} /></button>}
          </span>
        </label>
        <label className="account-edit__field">
          <span>Email</span>
          <input value="scott_wu@mail.com" readOnly />
        </label>
        <div className="account-edit__actions">
          <Button size="Small" variant="Tertiary" onClick={onClose}>Cancel</Button>
          <Button size="Small" variant="Secondary" onClick={onClose}>Save</Button>
        </div>
      </section>
    </div>
  )
}

function AccountPage() {
  const { signOut } = useAuth()
  const [dialog, setDialog] = useState<DialogType>(null)
  const isSettings = window.location.pathname.startsWith('/account/settings')

  function completeSignOut() {
    signOut()
    window.location.href = '/home'
  }

  return (
    <AppLayout navbar={isSettings ? <DetailNavbar credits={390} backHref="/account" /> : <RoomNavbar title="Account" credits={390} />}>
      <section className="account-page">
        <div className="account-page__content">
          {isSettings ? (
            <div className="account-page__rows account-page__rows--settings">
              <AccountRow icon={icFileText} title="Terms of Use" />
              <AccountRow icon={icShieldCheck} title="Privacy Policy" />
              <AccountRow icon={icCalendarX} title="Unsubscribe" />
              <AccountRow icon={icUserX} title="Delete Account" onClick={() => setDialog('delete')} />
              <AccountRow icon={icLogOut} title="Sign Out" onClick={() => setDialog('signout')} />
            </div>
          ) : (
            <>
              <div className="account-page__profile">
                <div className="account-page__identity">
                  <span className="account-page__avatar"><span style={maskStyle(icUser)} aria-hidden="true" /></span>
                  <span className="account-page__identity-copy"><strong>Scott Wu</strong><span>scott_wu@mail.com</span></span>
                  <IconButton size="XSmall" variant="Tertiary" icon={icEdit} label="Edit profile" onClick={() => setDialog('edit')} />
                </div>
                <div className="account-page__stats">
                  <a href="/account/credits"><strong>360 <img src={icCredit} alt="credits" /></strong><span>Credits</span></a>
                  <i />
                  <a href="/community-profile?tab=music-videos"><strong>12</strong><span>MVs</span></a>
                  <i />
                  <a href="/community-profile?tab=songs"><strong>28</strong><span>Songs</span></a>
                </div>
              </div>
              <div className="account-page__rows">
                <AccountRow icon={icCrown} title="Weekly Pro" subtitle="Validity: 2026-08-10" />
                <div className="account-page__divider" />
                <AccountRow icon={icNotification} title="Notifications" subtitle="On" />
                <AccountRow icon={icLanguage} title="Language" subtitle="English" />
                <AccountRow icon={icSend} title="Send Feedback" />
                <AccountRow icon={icSettings} title="Settings" href="/account/settings" />
                <div className="account-page__divider" />
                <AccountRow icon={icLogOut} title="Sign Out" onClick={() => setDialog('signout')} />
              </div>
            </>
          )}
        </div>
      </section>
      {dialog === 'edit' && <EditProfileDialog onClose={() => setDialog(null)} />}
      {(dialog === 'signout' || dialog === 'delete') && (
        <ConfirmDialog type={dialog} onCancel={() => setDialog(null)} onConfirm={completeSignOut} />
      )}
    </AppLayout>
  )
}

export default AccountPage
