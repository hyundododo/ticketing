import { useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import BookingOptionModal from '../features/seat/components/BookingOptionModal'
import SeatMap from '../features/seat/components/SeatMap'
import { rememberSeatLabel } from '../features/seat/seatLabel'
import { holdSeat } from '../features/seat/api/seatApi'
import { useSeats } from '../features/seat/hooks/useSeats'

function SeatPage({ concert, onNotice, onCart, onPayment }) {
    const { seats, loading, error, reload } = useSeats(concert.id)
    const [selectedSeat, setSelectedSeat] = useState(null)
    const [holding, setHolding] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const selectSeat = (seat) => { rememberSeatLabel(seat.id, seat.seatLabel); setSelectedSeat(seat) }
    const startBooking = async () => { if (!selectedSeat || holding) return; setHolding(true); try { await holdSeat(selectedSeat.id); setShowModal(true) } catch (requestError) { onNotice('error', getErrorMessage(requestError)); reload() } finally { setHolding(false) } }
    const item = selectedSeat && { seatId: selectedSeat.id, seatLabel: selectedSeat.seatLabel, concertId: concert.id, concertName: concert.concertName || concert.name }
    const addToCart = async () => { setSubmitting(true); try { await onCart(item); setShowModal(false); setSelectedSeat(null) } catch (requestError) { onNotice('error', getErrorMessage(requestError)); reload() } finally { setSubmitting(false) } }
    const goToPayment = () => { setShowModal(false); onPayment(item); setSelectedSeat(null) }
    return <section className="seat-section"><div className="section-heading"><div><h2>{concert.concertName || concert.name}</h2><p>공연장 좌석을 선택하세요.</p></div></div>{loading ? <div className="loading-state">좌석을 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={reload}>다시 시도</button></div> : !seats.length ? <div className="empty-state"><strong>선택한 콘서트에 좌석이 없습니다.</strong></div> : <><SeatMap seats={seats} selectedSeat={selectedSeat} onSelect={selectSeat} />{selectedSeat && <div className="booking-bar"><span>좌석 <strong>{selectedSeat.seatLabel}</strong> 선택</span><button className="dark-button" disabled={holding} onClick={startBooking}>{holding ? '좌석 점유 중...' : '예매하기 →'}</button></div>}{showModal && <BookingOptionModal seat={selectedSeat} onClose={addToCart} onCart={addToCart} onPayment={goToPayment} submitting={submitting} />}</>}</section>
}

export default SeatPage
