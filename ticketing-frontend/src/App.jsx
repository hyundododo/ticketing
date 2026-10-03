import { useEffect, useState } from 'react'
import './App.css'

const tokenKey = 'ticketing.accessToken'
const refreshKey = 'ticketing.refreshToken'

async function request(path, options = {}) {
    const accessToken = localStorage.getItem(tokenKey)
    const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`
    const response = await fetch(path, { ...options, credentials: options.credentials || 'same-origin', headers })
    const text = await response.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    if (!response.ok) throw new Error(data?.message || data?.error || `요청에 실패했습니다. (${response.status})`)
    return data
}

function tokenRole(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return payload.role || payload.authorities?.[0] || ''
    } catch { return '' }
}

function App() {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem(tokenKey))
    const [profile, setProfile] = useState(null)
    const [concerts, setConcerts] = useState([])
    const [selectedConcert, setSelectedConcert] = useState(null)
    const [view, setView] = useState('concerts')
    const [notice, setNotice] = useState(null)
    const [catalogError, setCatalogError] = useState(false)
    const isAdmin = accessToken ? tokenRole(accessToken).includes('ADMIN') : false

    const notify = (type, message) => setNotice({ type, message })
    const loadCatalog = async () => {
        try {
            const data = await request('/api/concerts')
            const list = Array.isArray(data)
                ? data.map(({ id, concertName }) => ({ id, concertName }))
                : []
            setConcerts(list)
            setSelectedConcert((current) => current && list.some((concert) => concert.id === current.id) ? current : null)
            setCatalogError(false)
        } catch (error) {
            setCatalogError(true)
            notify('error', error.message)
        }
    }

    useEffect(() => {
        if (!accessToken) return
        request('/user', { headers: { 'Content-Type': 'application/json' } }).then(setProfile).catch((error) => notify('error', error.message))
        loadCatalog()
    }, [accessToken])

    const signOut = () => {
        localStorage.removeItem(tokenKey)
        localStorage.removeItem(refreshKey)
        setAccessToken(null)
        setProfile(null)
        setSelectedConcert(null)
        setView('concerts')
    }

    const showMyTickets = () => {
        setView('tickets')
    }

    const addConcert = (concert) => {
        setConcerts((current) => [...current.filter((item) => item.id !== concert.id), concert])
        setSelectedConcert(concert)
    }

    const deleteConcert = async (concertId) => {
        try {
            await request(`/api/concerts/${concertId}`, { method: 'DELETE' })
            setConcerts((current) => current.filter((concert) => concert.id !== concertId))
            setSelectedConcert((current) => current?.id === concertId ? null : current)
            notify('success', '콘서트가 삭제되었습니다.')
        } catch (error) {
            notify('error', error.message)
        }
    }

    if (window.location.pathname === '/cookie') return <CookieExchange onSuccess={(tokens) => { localStorage.setItem(tokenKey, tokens.accessToken); localStorage.setItem(refreshKey, tokens.refreshToken); window.location.href = '/' }} onError={(message) => notify('error', message)} />
    if (!accessToken) return <Shell notice={notice} setNotice={setNotice}><Auth onSuccess={(tokens) => { localStorage.setItem(tokenKey, tokens.accessToken); localStorage.setItem(refreshKey, tokens.refreshToken); setAccessToken(tokens.accessToken) }} onError={(message) => notify('error', message)} /></Shell>

    return <Shell notice={notice} setNotice={setNotice} profile={profile} onSignOut={signOut}>
        <div className="page-header"><div><span className="eyebrow">TICKETING</span><h1>{view === 'tickets' ? '나의 티켓' : isAdmin ? '콘서트 관리' : '공연 선택'}</h1></div><div className="page-actions"><button className="text-button" onClick={() => setView(view === 'tickets' ? 'concerts' : 'tickets')}>{view === 'tickets' ? '공연 목록' : '나의 티켓'}</button>{view === 'concerts' && <button className="text-button" onClick={loadCatalog}>목록 새로고침</button>}</div></div>
        {view === 'tickets' ? <MyTickets concerts={concerts} onNotice={notify} /> : <><>{isAdmin && <AdminPanel onCreated={addConcert} onError={(message) => notify('error', message)} onSuccess={(message) => notify('success', message)} />}</>{catalogError && <div className="empty-state"><strong>콘서트 목록을 불러오지 못했습니다.</strong><p>잠시 후 목록 새로고침을 눌러 다시 시도해주세요.</p></div>}<ConcertList concerts={concerts} selected={selectedConcert} onSelect={setSelectedConcert} canDelete={isAdmin} onDelete={deleteConcert} />{selectedConcert && <SeatPicker concert={selectedConcert} onNotice={notify} onBooked={showMyTickets} />}</>}
    </Shell>
}

function Shell({ children, notice, setNotice, profile, onSignOut }) {
    return <div className="app-shell"><header className="topbar"><button className="brand" onClick={() => { window.location.href = '/' }}><span className="brand-mark">T</span>ticketing</button><div className="account">{profile?.nickname || profile?.username}{onSignOut && <button className="logout" onClick={onSignOut}>로그아웃</button>}</div></header><main>{notice && <div className={`notice ${notice.type}`} role="status">{notice.message}<button onClick={() => setNotice(null)}>닫기</button></div>}{children}</main><footer>ticketing service</footer></div>
}

function Auth({ onSuccess, onError }) {
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ username: '', password: '', nickname: '', email: '' })
    const [loading, setLoading] = useState(false)
    const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
    const submit = async (event) => {
        event.preventDefault(); setLoading(true)
        try {
            const body = mode === 'login' ? { username: form.username, password: form.password } : form
            const data = await request(mode === 'login' ? '/login' : '/user', { method: 'POST', body: JSON.stringify(body) })
            if (mode === 'login') onSuccess(data)
            else { setMode('login'); onError('가입이 완료되었습니다. 로그인해주세요.') }
        } catch (error) { onError(error.message) } finally { setLoading(false) }
    }
    return <section className="auth"><div className="auth-copy"><span className="eyebrow">TICKETING</span><h1>공연을 고르고,<br /><em>좌석을 예약하세요.</em></h1><p>등록된 공연에서 원하는 좌석을 선택해 간편하게 예매할 수 있습니다.</p></div><form className="auth-form" onSubmit={submit}><div className="tabs"><button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')}>로그인</button><button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => setMode('register')}>회원가입</button></div><Field label="아이디" name="username" value={form.username} onChange={update} placeholder="아이디" /><Field label="비밀번호" name="password" type="password" value={form.password} onChange={update} placeholder="비밀번호" />{mode === 'register' && <><Field label="닉네임" name="nickname" value={form.nickname} onChange={update} placeholder="닉네임" /><Field label="이메일" name="email" type="email" value={form.email} onChange={update} placeholder="이메일" /></>}<button className="primary-button" disabled={loading}>{loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'} <span>→</span></button><div className="social-divider"><span>또는</span></div><div className="social-buttons"><a className="social-button naver" href="http://localhost:8080/oauth2/authorization/naver">N 네이버 로그인</a><a className="social-button google" href="http://localhost:8080/oauth2/authorization/google">G Google 로그인</a></div></form></section>
}

function CookieExchange({ onSuccess, onError }) {
    useEffect(() => { request('/jwt/exchange', { method: 'POST', credentials: 'include', body: JSON.stringify({}) }).then(onSuccess).catch((error) => onError(error.message)) }, [onSuccess, onError])
    return <Shell><div className="loading-state">소셜 로그인 정보를 확인하는 중...</div></Shell>
}

function AdminPanel({ onCreated, onError, onSuccess }) {
    const submit = async (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        try {
            const id = await request('/api/concerts', { method: 'POST', body: JSON.stringify({ concertName: data.get('concertName'), seatCount: Number(data.get('seatCount')) }) })
            const concertId = typeof id === 'object' ? id.id || id.concertId : id
            onCreated({ id: concertId, concertName: data.get('concertName'), seatCount: Number(data.get('seatCount')) })
            event.currentTarget.reset()
            onSuccess(`콘서트가 등록되었습니다. ID: ${concertId}`)
        } catch (error) { onError(error.message) }
    }
    return <form className="admin-panel" onSubmit={submit}><div><span className="eyebrow">ADMIN ONLY</span><h2>콘서트 등록</h2><p>좌석은 등록한 좌석 수만큼 자동 생성됩니다.</p></div><Field label="콘서트명" name="concertName" placeholder="공연 이름" /><Field label="좌석 수" name="seatCount" type="number" min="1" placeholder="좌석 수" /><button className="dark-button">등록 <span>→</span></button></form>
}

function ConcertList({ concerts, selected, onSelect, canDelete, onDelete }) {
    return <section className="concert-section"><div className="section-heading"><h2>등록된 콘서트</h2><span>{concerts.length}개</span></div>{concerts.length === 0 ? <div className="empty-state"><strong>등록된 콘서트가 없습니다.</strong><p>관리자가 콘서트를 등록하면 이곳에서 선택할 수 있습니다.</p></div> : <div className="concert-list">{concerts.map((concert) => <div className={`concert-item ${selected?.id === concert.id ? 'selected' : ''}`} key={concert.id}><button className="concert-select" onClick={() => onSelect(concert)}><span>{concert.concertName || concert.name}</span><small>{concert.seatCount ? `${concert.seatCount}석` : `ID ${concert.id}`}</small></button>{canDelete && <button className="delete-concert" onClick={() => { if (window.confirm(`'${concert.concertName}' 콘서트를 삭제할까요?`)) onDelete(concert.id) }} aria-label={`${concert.concertName} 삭제`}>삭제</button>}</div>)}</div>}</section>
}

function SeatPicker({ concert, onNotice, onBooked }) {
    const [seats, setSeats] = useState([])
    const [selectedSeat, setSelectedSeat] = useState(null)
    const [loading, setLoading] = useState(true)
    useEffect(() => { setLoading(true); request(`/api/seats/${concert.id}`).then((data) => setSeats(Array.isArray(data) ? data : [])).catch(() => setSeats(null)).finally(() => setLoading(false)) }, [concert.id])
    const book = async () => { try { const ticketId = await request(`/api/tickets/${selectedSeat.id}`, { method: 'POST' }); onNotice('success', `예매가 완료되었습니다. 티켓 ID: ${ticketId}`); onBooked(ticketId); setSelectedSeat(null) } catch (error) { onNotice('error', error.message) } }
    const seatRows = seats.reduce((rows, seat, index) => {
        const rowIndex = Math.floor(index / 8)
        if (!rows[rowIndex]) rows[rowIndex] = []
        rows[rowIndex].push(seat)
        return rows
    }, [])
    return <section className="seat-section"><div className="section-heading"><div><h2>{concert.concertName || concert.name}</h2><p>공연장 좌석을 선택하세요.</p></div></div>{loading ? <p className="small-note">좌석을 불러오는 중...</p> : seats === null ? <div className="empty-state"><strong>좌석 목록을 불러올 수 없습니다.</strong><p>잠시 후 다시 시도해주세요.</p></div> : seats.length === 0 ? <div className="empty-state"><strong>선택한 콘서트에 좌석이 없습니다.</strong></div> : <><div className="venue-map"><div className="stage"><span>STAGE</span><small>{concert.concertName || concert.name}</small></div><div className="seat-map-label">관객석</div><div className="seat-rows">{seatRows.map((row, rowIndex) => <div className="seat-row" key={rowIndex}><span className="row-label">{String.fromCharCode(65 + rowIndex)}</span><div className="seat-row-items">{row.map((seat) => <button disabled={seat.isOccupied} className={`seat ${selectedSeat?.id === seat.id ? 'selected' : ''} ${seat.isOccupied ? 'occupied' : ''}`} key={seat.id} onClick={() => setSelectedSeat(seat)} aria-label={`${seat.id}번 좌석`}>{seat.id}</button>)}</div></div>)}</div><div className="seat-legend"><span><i className="legend-seat available" /> 선택 가능</span><span><i className="legend-seat selected" /> 선택됨</span><span><i className="legend-seat occupied" /> 예매 완료</span></div></div>{selectedSeat && <div className="booking-bar"><span>좌석 <strong>{selectedSeat.id}</strong> 선택</span><button className="dark-button" onClick={book}>예매하기 →</button></div>}</>}</section>
}

function MyTickets({ concerts, onNotice }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(true)
        request('/api/tickets')
            .then((data) => setTickets(Array.isArray(data) ? data : data ? [data] : []))
            .catch((error) => onNotice('error', error.message))
            .finally(() => setLoading(false))
    }, [onNotice])

    if (loading) return <div className="loading-state">나의 티켓을 불러오는 중...</div>
    if (tickets.length === 0) return <div className="empty-state"><strong>예매한 티켓이 없습니다.</strong><p>공연을 선택하고 좌석을 예매해보세요.</p></div>
    return <section className="ticket-list">{tickets.map((ticket) => { const concert = concerts.find((item) => item.id === ticket.concertId); return <article className="ticket-card" key={ticket.id}><div className="ticket-card-main"><span className="eyebrow">TICKET #{ticket.id}</span><h2>{concert?.concertName || `콘서트 #${ticket.concertId}`}</h2><p>좌석 <strong>{ticket.seatId}</strong></p></div><time>{ticket.createdDate ? new Date(ticket.createdDate).toLocaleString('ko-KR') : '예매 완료'}</time></article> })}</section>
}

function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input required {...props} /></label> }

export default App
