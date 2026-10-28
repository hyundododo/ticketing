import { getSeatStatus } from '../seatStatus'

function SeatMap({ seats, selectedSeats, onSelect }) {
    const seatsPerZone = 36
    const zones = Array.from({ length: Math.ceil(seats.length / seatsPerZone) }, (_, zoneIndex) => ({ name: String.fromCharCode(65 + zoneIndex), index: zoneIndex, seats: seats.slice(zoneIndex * seatsPerZone, (zoneIndex + 1) * seatsPerZone) }))
    return <div className="venue-map"><div className="stage"><span>STAGE</span></div><div className="seat-map-label">공연장 좌석 · 36석 단위 구역</div><div className="seat-zones">{zones.map((zone) => <section className={`seat-zone zone-${zone.index % 5}`} key={zone.name}><h3>{zone.name}구역 <small>1–{zone.seats.length}</small></h3><div className="seat-zone-items">{zone.seats.map((seat, seatIndex) => { const seatLabel = `${zone.name}${seatIndex + 1}`; const seatWithLabel = { ...seat, seatLabel }; const style = getSeatStatus(seatWithLabel); return <button className={`seat zone-seat-${zone.index % 5} ${style.className} ${selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id) ? 'selected' : ''}`} disabled={style.disabled} key={seat.id} onClick={() => onSelect(seatWithLabel)} aria-label={`${seatLabel} 좌석, ${style.label}`}>{seatLabel}</button> })}</div></section>)}</div><div className="seat-legend"><span><i className="legend-seat available" /> 선택 가능</span><span><i className="legend-seat selected" /> 선택됨</span><span><i className="legend-seat occupied" /> 예매 완료</span></div></div>
}

export default SeatMap
