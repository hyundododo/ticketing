import { getSeatStatus } from '../seatStatus'
import { getSeatLabel } from '../seatLabel'

function SeatMap({ seats, selectedSeat, onSelect }) {
    const rows = seats.reduce((result, seat, index) => { const row = Math.floor(index / 8); if (!result[row]) result[row] = []; result[row].push({ ...seat, seatLabel: getSeatLabel(index) }); return result }, [])
    return <div className="venue-map"><div className="stage"><span>STAGE</span></div><div className="seat-map-label">관객석 · A열부터 8석씩 배치</div><div className="seat-rows">{rows.map((row, rowIndex) => <div className="seat-row" key={rowIndex}><span className="row-label">{String.fromCharCode(65 + rowIndex)}</span><div className="seat-row-items">{row.map((seat) => { const style = getSeatStatus(seat); return <button className={`seat ${style.className} ${selectedSeat?.id === seat.id ? 'selected' : ''}`} disabled={style.disabled} key={seat.id} onClick={() => onSelect(seat)} aria-label={`${seat.seatLabel} 좌석, ${style.label}`}>{seat.seatLabel}</button> })}</div></div>)}</div><div className="seat-legend"><span><i className="legend-seat available" /> 선택 가능</span><span><i className="legend-seat selected" /> 선택됨</span><span><i className="legend-seat occupied" /> 예매 완료</span></div></div>
}

export default SeatMap
