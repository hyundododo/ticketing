export const seatStatusStyles = {
    AVAILABLE: { className: 'available', disabled: false, label: '선택 가능' },
    HELD: { className: 'occupied', disabled: true, label: '예매 완료' },
    SOLD: { className: 'occupied', disabled: true, label: '예매 완료' },
}

export const getSeatStatus = (seat) => seatStatusStyles[String(seat.status || '').toUpperCase()] || seatStatusStyles.AVAILABLE
