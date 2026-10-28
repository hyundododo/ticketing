import { useEffect, useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import BookingOptionModal from '../features/seat/components/BookingOptionModal'
import SeatMap from '../features/seat/components/SeatMap'
import { rememberSeatLabel } from '../features/seat/seatLabel'
import { holdSeat } from '../features/seat/api/seatApi'
import { useSeats } from '../features/seat/hooks/useSeats'

function SeatPage({ concert, onNotice, onCart, onPayment, onClose }) {
    const { seats, loading, error, reload } = useSeats(concert.id)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [holding, setHolding] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const selectSeat = (seat) => {
        rememberSeatLabel(seat.id, seat.seatLabel)
        setSelectedSeats((current) => current.some((selectedSeat) => selectedSeat.id === seat.id)
            ? current.filter((selectedSeat) => selectedSeat.id !== seat.id)
            : [...current, seat])
    }
    const startBooking = async () => {
        if (!selectedSeats.length || holding) return
        setHolding(true)
        try {
            for (const seat of selectedSeats) await holdSeat(concert.id, seat.id)
            setShowModal(true)
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
            reload()
        } finally {
            setHolding(false)
        }
    }
    const items = selectedSeats.map((seat) => ({ seatId: seat.id, seatLabel: seat.seatLabel, concertId: concert.id, concertName: concert.concertName || concert.name }))
    const addToCart = async () => {
        setSubmitting(true)
        try {
            await onCart(items)
            setShowModal(false)
            setSelectedSeats([])
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
            reload()
        } finally {
            setSubmitting(false)
        }
    }
    const goToPayment = () => { setShowModal(false); onPayment(items); setSelectedSeats([]) }
    useEffect(() => {
        const closeOnEscape = (event) => { if (event.key === 'Escape') onClose() }
        document.addEventListener('keydown', closeOnEscape)
        return () => document.removeEventListener('keydown', closeOnEscape)
    }, [onClose])
    return <div className="seat-modal" role="dialog" aria-modal="true" aria-label={`${concert.concertName || concert.name} 좌석 선택`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="seat-section"><button className="seat-modal-close modal-close" onClick={onClose} aria-label="좌석 선택 닫기">×</button><div className="section-heading"><div><h2>{concert.concertName || concert.name}</h2><p>원하는 좌석을 여러 개 선택하세요.</p></div></div>{loading ? <div className="loading-state">좌석을 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={reload}>다시 시도</button></div> : !seats.length ? <div className="empty-state"><strong>선택한 콘서트에 좌석이 없습니다.</strong></div> : <><SeatMap seats={seats} selectedSeats={selectedSeats} onSelect={selectSeat} />{selectedSeats.length > 0 && <div className="booking-bar"><span><strong>{selectedSeats.length}개 좌석</strong> 선택 · {selectedSeats.map((seat) => seat.seatLabel).join(', ')}</span><button className="dark-button" disabled={holding} onClick={startBooking}>{holding ? '좌석 점유 중...' : '예매하기 →'}</button></div>}{showModal && <BookingOptionModal seats={selectedSeats} onClose={addToCart} onCart={addToCart} onPayment={goToPayment} submitting={submitting} />}</>}</section></div>
}

export default SeatPage
