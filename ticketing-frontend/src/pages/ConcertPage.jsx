import { useCallback, useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import { createConcert, deleteConcert } from '../features/concert/api/concertApi'
import { enterWaiting } from '../features/waiting/api/waitingApi'
import WaitingModal from '../features/waiting/components/WaitingModal'
import ConcertList from '../features/concert/components/ConcertList'
import { useConcerts } from '../features/concert/hooks/useConcerts'
import SeatPage from './SeatPage'

function ConcertPage({ onNotice, onCart, onPayment, isAdmin }) {
    const { concerts, loading, error, reload } = useConcerts()
    const [detailConcert, setDetailConcert] = useState(null)
    const [selectedConcert, setSelectedConcert] = useState(null)
    const [concertName, setConcertName] = useState('')
    const [seatCount, setSeatCount] = useState('')
    const [place, setPlace] = useState('')
    const [description, setDescription] = useState('')
    const [posterUrl, setPosterUrl] = useState('')
    const [concertStatus, setConcertStatus] = useState('PREPARING')
    const [bookingOpenAt, setBookingOpenAt] = useState('')
    const [creating, setCreating] = useState(false)
    const [deletingConcertId, setDeletingConcertId] = useState(null)
    const [waitingConcert, setWaitingConcert] = useState(null)
    const [waitingRank, setWaitingRank] = useState(null)
    const [enteringConcertId, setEnteringConcertId] = useState(null)
    const selectConcert = (concert) => {
        setDetailConcert(concert)
    }
    const startBooking = async (concert) => {
        if (enteringConcertId) return
        setEnteringConcertId(concert.id)
        try {
            const response = await enterWaiting(concert.id)
            if (response.status === 'ALLOWED') {
                setDetailConcert(null)
                setSelectedConcert(concert)
            } else if (response.status === 'WAITING') {
                setWaitingConcert(concert)
                setWaitingRank(response.rank)
            } else {
                onNotice('error', '대기열에 진입할 수 없습니다.')
            }
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
        } finally {
            setEnteringConcertId(null)
        }
    }
    const openSelectedConcert = useCallback(() => {
        setWaitingConcert(null)
        setWaitingRank(null)
        setDetailConcert(null)
        setSelectedConcert(waitingConcert)
    }, [waitingConcert])
    const create = async (event) => {
        event.preventDefault()
        const trimmedName = concertName.trim()
        const parsedSeatCount = Number(seatCount)
        if (!trimmedName || !Number.isInteger(parsedSeatCount) || parsedSeatCount < 1 || creating) return
        setCreating(true)
        try {
            await createConcert({
                concertName: trimmedName,
                seatCount: parsedSeatCount,
                place: place.trim(),
                description: description.trim(),
                posterUrl: posterUrl.trim(),
                concertStatus,
                bookingOpenAt: bookingOpenAt || null,
            })
            setConcertName('')
            setSeatCount('')
            setPlace('')
            setDescription('')
            setPosterUrl('')
            setConcertStatus('PREPARING')
            setBookingOpenAt('')
            await reload()
            onNotice('success', '콘서트가 생성되었습니다.')
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
        } finally {
            setCreating(false)
        }
    }
    const remove = async (concert) => {
        if (deletingConcertId || !window.confirm(`'${concert.concertName}' 콘서트를 삭제하시겠습니까?`)) return
        setDeletingConcertId(concert.id)
        try {
            await deleteConcert(concert.id)
            if (selectedConcert?.id === concert.id) setSelectedConcert(null)
            if (detailConcert?.id === concert.id) setDetailConcert(null)
            await reload()
            onNotice('success', '콘서트가 삭제되었습니다.')
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
        } finally {
            setDeletingConcertId(null)
        }
    }
    const statusLabels = { PREPARING: '준비 중', ON_SALE: '예매 가능', SOLD_OUT: '매진', ENDED: '종료', CANCELED: '취소' }
    return <><div className="page-header"><div><span className="eyebrow">TICKETING</span><h1>공연 선택</h1></div><button className="text-button" onClick={reload}>목록 새로고침</button></div>{isAdmin && <form className="admin-panel concert-create-form" onSubmit={create}><div><span className="eyebrow">ADMIN ONLY</span><h2>콘서트 관리</h2><p>새로운 콘서트와 좌석을 등록하거나 기존 콘서트를 삭제할 수 있습니다.</p></div><label className="field"><span>콘서트 이름</span><input value={concertName} onChange={(event) => setConcertName(event.target.value)} placeholder="콘서트 이름" required /></label><label className="field"><span>좌석 수</span><input type="number" min="1" step="1" value={seatCount} onChange={(event) => setSeatCount(event.target.value)} placeholder="좌석 수" required /></label><label className="field"><span>공연 장소</span><input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="공연 장소" /></label><label className="field"><span>예매 오픈 일시</span><input type="datetime-local" value={bookingOpenAt} onChange={(event) => setBookingOpenAt(event.target.value)} /></label><label className="field"><span>공연 상태</span><select value={concertStatus} onChange={(event) => setConcertStatus(event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="field field-wide"><span>공연 설명</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="공연 설명" rows="2" /></label><label className="field field-wide"><span>포스터 URL</span><input type="url" value={posterUrl} onChange={(event) => setPosterUrl(event.target.value)} placeholder="https://..." /></label><button className="dark-button" type="submit" disabled={creating}>{creating ? '생성 중...' : '콘서트 생성'} <span>→</span></button></form>}<section className="concert-section"><div className="section-heading"><h2>등록된 콘서트</h2><span>{concerts.length}개</span></div>{loading ? <div className="loading-state">공연 목록을 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={reload}>다시 시도</button></div> : <ConcertList concerts={concerts} selectedId={detailConcert?.id} onSelect={selectConcert} canDelete={isAdmin} onDelete={remove} deletingConcertId={deletingConcertId} />}</section>{detailConcert && <div className="concert-detail-modal ios-concert-detail-modal" role="dialog" aria-modal="true" aria-label="콘서트 상세 정보" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailConcert(null) }}><section className="concert-detail ios-concert-detail"><button className="text-button concert-detail-close" onClick={() => setDetailConcert(null)}>닫기</button><div className="concert-detail-grid">{detailConcert.posterUrl ? <img src={detailConcert.posterUrl} alt="" /> : <div className="concert-detail-placeholder">LIVE<br />CONCERT</div>}<div><span className="eyebrow">CONCERT DETAIL</span><h2>{detailConcert.concertName || detailConcert.name}</h2><dl><div><dt>장소</dt><dd>{detailConcert.place || '장소 미정'}</dd></div><div><dt>예매 오픈</dt><dd>{detailConcert.bookingOpenAt ? new Date(detailConcert.bookingOpenAt).toLocaleString('ko-KR') : '일정 미정'}</dd></div><div><dt>상태</dt><dd>{statusLabels[detailConcert.concertStatus] || '상태 미정'}</dd></div></dl><p>{detailConcert.description || '공연 상세 정보가 아직 등록되지 않았습니다.'}</p><button className="dark-button" disabled={Boolean(enteringConcertId) || ['SOLD_OUT', 'ENDED', 'CANCELED'].includes(detailConcert.concertStatus)} onClick={() => startBooking(detailConcert)}>{enteringConcertId ? '입장 준비 중...' : '예매하기 →'}</button></div></div></section></div>}{waitingConcert && <WaitingModal concert={waitingConcert} initialRank={waitingRank} onAllowed={openSelectedConcert} onClose={() => { setWaitingConcert(null); setWaitingRank(null) }} onNotice={onNotice} />}{selectedConcert && <SeatPage concert={selectedConcert} onNotice={onNotice} onCart={onCart} onPayment={onPayment} onClose={() => setSelectedConcert(null)} />}</>
}

export default ConcertPage
