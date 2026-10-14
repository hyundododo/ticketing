import { useEffect } from 'react'

function AppLayout({ children, notice, setNotice, profile, onSignOut, onProfile }) {
    useEffect(() => {
        if (!notice) return undefined
        const timeoutId = window.setTimeout(() => setNotice(null), 2000)
        return () => window.clearTimeout(timeoutId)
    }, [notice, setNotice])

    return <div className="app-shell">
        <header className="topbar">
            <button className="brand" onClick={() => { window.location.href = '/' }} aria-label="ticketing 홈으로 이동">
                <span className="brand-mark">T</span>
                ticketing
            </button>
            <div className="account">
                {profile && <button className="account-name" onClick={onProfile} type="button">{profile.nickname || profile.username}</button>}
                {onSignOut && <button className="logout" onClick={onSignOut}>로그아웃 <span aria-hidden="true">↗</span></button>}
            </div>
        </header>
        <main>
            {notice && <div className={`notice ${notice.type}`} role="status"><span>{notice.message}</span><button className="notice-close" onClick={() => setNotice(null)} aria-label="알림 닫기">×</button></div>}
            {children}
        </main>
        <footer>ticketing service</footer>
    </div>
}

export default AppLayout
