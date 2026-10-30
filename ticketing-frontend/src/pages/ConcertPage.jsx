import { useCallback, useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import { createConcert, deleteConcert } from '../features/concert/api/concertApi'
import { createSeat } from '../features/seat/api/seatApi'
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
    const [price, setPrice] = useState('')
    const [place, setPlace] = useState('')
    const [description, setDescription] = useState('')
    const [posterUrl, setPosterUrl] = useState('')
    const [concertStatus, setConcertStatus] = useState('PREPARING')
    const [bookingOpenAt, setBookingOpenAt] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
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
        const parsedPrice = Number(price)
        if (!trimmedName || !Number.isInteger(parsedSeatCount) || parsedSeatCount < 1 || !Number.isInteger(parsedPrice) || parsedPrice < 0 || creating) return
        setCreating(true)
        try {
            const concertId = await createConcert({
                concertName: trimmedName,
                seatCount: 0,
                place: place.trim(),
                description: description.trim(),
                posterUrl: posterUrl.trim(),
                concertStatus,
                bookingOpenAt: bookingOpenAt || null,
            })
            for (let seatIndex = 0; seatIndex < parsedSeatCount; seatIndex += 1) {
                await createSeat(concertId, parsedPrice)
            }
            setConcertName('')
            setSeatCount('')
            setPrice('')
            setPlace('')
            setDescription('')
            setPosterUrl('')
            setConcertStatus('PREPARING')
            setBookingOpenAt('')
            await reload()
            setShowCreateModal(false)
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
    return <>
        <div className="page-header">
            <div><span className="eyebrow">TICKETING</span><h1>공연 선택</h1></div>
            <div className="page-header-actions">
                {isAdmin && <button className="dark-button create-concert-trigger" onClick={() => setShowCreateModal(true)}>콘서트 만들기 <span>+</span></button>}
                <button className="text-button" onClick={reload}>목록 새로고침</button>
            </div>
        </div>
        {isAdmin && showCreateModal && <div className="create-concert-modal" role="dialog" aria-modal="true" aria-labelledby="create-concert-title" onMouseDown={(event) => { if (event.target === event.currentTarget && !creating) setShowCreateModal(false) }}>
            <form className="create-concert-card" onSubmit={create}>
                <div className="create-concert-header"><div><span className="eyebrow">ADMIN ONLY</span><h2 id="create-concert-title">새 콘서트 만들기</h2><p>공연 정보와 좌석 가격을 입력해 티켓을 준비하세요.</p></div><button type="button" className="modal-close-button" onClick={() => setShowCreateModal(false)} disabled={creating} aria-label="콘서트 만들기 닫기">×</button></div>
                <div className="create-concert-fields">
                    <label className="field"><span>콘서트 이름</span><input value={concertName} onChange={(event) => setConcertName(event.target.value)} placeholder="예: Summer Live 2026" required /></label>
                    <label className="field"><span>좌석 수</span><input type="number" min="1" step="1" value={seatCount} onChange={(event) => setSeatCount(event.target.value)} placeholder="예: 500" required /></label>
                    <label className="field"><span>좌석 가격</span><div className="price-input"><input type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="예: 99000" required /><span>원</span></div></label>
                    <label className="field"><span>공연 장소</span><input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="공연 장소" /></label>
                    <label className="field"><span>예매 오픈 일시</span><input type="datetime-local" value={bookingOpenAt} onChange={(event) => setBookingOpenAt(event.target.value)} /></label>
                    <label className="field"><span>공연 상태</span><select value={concertStatus} onChange={(event) => setConcertStatus(event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label className="field field-wide"><span>공연 설명</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="공연에 대한 간단한 설명을 입력하세요." rows="3" /></label>
                    <label className="field field-wide"><span>포스터 URL <small>선택 사항</small></span><input type="url" value={posterUrl} onChange={(event) => setPosterUrl(event.target.value)} placeholder="https://..." /></label>
                </div>
                <div className="create-concert-actions"><button type="button" className="cancel-button" onClick={() => setShowCreateModal(false)} disabled={creating}>취소</button><button className="dark-button" type="submit" disabled={creating}>{creating ? '생성 중...' : '콘서트 생성'} <span>→</span></button></div>
            </form>
        </div>}
        <section className="concert-section"><div className="section-heading"><h2>등록된 콘서트</h2><span>{concerts.length}개</span></div>{loading ? <div className="loading-state">공연을 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={reload}>다시 시도</button></div> : <ConcertList concerts={concerts} selectedId={detailConcert?.id} onSelect={selectConcert} canDelete={isAdmin} onDelete={remove} deletingConcertId={deletingConcertId} />}</section>
        {detailConcert && <div className="concert-detail-modal ios-concert-detail-modal" role="dialog" aria-modal="true" aria-label="콘서트 상세 정보" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailConcert(null) }}><section className="concert-detail ios-concert-detail"><button className="text-button concert-detail-close" onClick={() => setDetailConcert(null)}>닫기</button><div className="concert-detail-grid">{detailConcert.posterUrl ? <img src={detailConcert.posterUrl} alt="" /> : <div className="concert-detail-placeholder">LIVE<br />CONCERT</div>}<div><span className="eyebrow">CONCERT DETAIL</span><h2>{detailConcert.concertName || detailConcert.name}</h2><dl><div><dt>장소</dt><dd>{detailConcert.place || '장소 미정'}</dd></div><div><dt>예매 오픈</dt><dd>{detailConcert.bookingOpenAt ? new Date(detailConcert.bookingOpenAt).toLocaleString('ko-KR') : '일정 미정'}</dd></div><div><dt>좌석 가격</dt><dd className="concert-price">{Number(detailConcert.price || 0).toLocaleString()}원</dd></div><div><dt>상태</dt><dd>{statusLabels[detailConcert.concertStatus] || '상태 미정'}</dd></div></dl><p>{detailConcert.description || '공연 상세 정보가 아직 등록되지 않았습니다.'}</p><button className="dark-button" disabled={Boolean(enteringConcertId) || ['SOLD_OUT', 'ENDED', 'CANCELED'].includes(detailConcert.concertStatus)} onClick={() => startBooking(detailConcert)}>{enteringConcertId ? '입장 준비 중...' : '예매하기 →'}</button></div></div></section></div>}
        {waitingConcert && <WaitingModal concert={waitingConcert} initialRank={waitingRank} onAllowed={openSelectedConcert} onClose={() => { setWaitingConcert(null); setWaitingRank(null) }} onNotice={onNotice} />}
        {selectedConcert && <SeatPage concert={selectedConcert} onNotice={onNotice} onCart={onCart} onPayment={onPayment} onClose={() => setSelectedConcert(null)} />}
    </>
}

export default ConcertPage
