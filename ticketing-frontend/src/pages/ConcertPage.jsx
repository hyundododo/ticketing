import { useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import { createConcert, deleteConcert } from '../features/concert/api/concertApi'
import ConcertList from '../features/concert/components/ConcertList'
import { useConcerts } from '../features/concert/hooks/useConcerts'
import SeatPage from './SeatPage'

function ConcertPage({ onNotice, onCart, onPayment, isAdmin }) {
    const { concerts, loading, error, reload } = useConcerts()
    const [selectedConcert, setSelectedConcert] = useState(null)
    const [concertName, setConcertName] = useState('')
    const [seatCount, setSeatCount] = useState('')
    const [creating, setCreating] = useState(false)
    const [deletingConcertId, setDeletingConcertId] = useState(null)
    const create = async (event) => {
        event.preventDefault()
        const trimmedName = concertName.trim()
        const parsedSeatCount = Number(seatCount)
        if (!trimmedName || !Number.isInteger(parsedSeatCount) || parsedSeatCount < 1 || creating) return
        setCreating(true)
        try {
            await createConcert({ concertName: trimmedName, seatCount: parsedSeatCount })
            setConcertName('')
            setSeatCount('')
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
            await reload()
            onNotice('success', '콘서트가 삭제되었습니다.')
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
        } finally {
            setDeletingConcertId(null)
        }
    }
    return <><div className="page-header"><div><span className="eyebrow">TICKETING</span><h1>공연 선택</h1></div><button className="text-button" onClick={reload}>목록 새로고침</button></div>{isAdmin && <form className="admin-panel" onSubmit={create}><div><span className="eyebrow">ADMIN ONLY</span><h2>콘서트 관리</h2><p>새로운 콘서트와 좌석을 등록하거나 기존 콘서트를 삭제할 수 있습니다.</p></div><label className="field"><span>콘서트 이름</span><input value={concertName} onChange={(event) => setConcertName(event.target.value)} placeholder="콘서트 이름" required /></label><label className="field"><span>좌석 수</span><input type="number" min="1" step="1" value={seatCount} onChange={(event) => setSeatCount(event.target.value)} placeholder="좌석 수" required /></label><button className="dark-button" type="submit" disabled={creating}>{creating ? '생성 중...' : '콘서트 생성'} <span>→</span></button></form>}<section className="concert-section"><div className="section-heading"><h2>등록된 콘서트</h2><span>{concerts.length}개</span></div>{loading ? <div className="loading-state">공연 목록을 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={reload}>다시 시도</button></div> : <ConcertList concerts={concerts} selectedId={selectedConcert?.id} onSelect={setSelectedConcert} canDelete={isAdmin} onDelete={remove} deletingConcertId={deletingConcertId} />}</section>{selectedConcert && <SeatPage concert={selectedConcert} onNotice={onNotice} onCart={onCart} onPayment={onPayment} />}</>
}

export default ConcertPage
