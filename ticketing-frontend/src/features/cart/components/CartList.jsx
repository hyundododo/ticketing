function CartList({ items, onRemove, removingSeatId }) {
    if (!items.length) return <div className="empty-state"><strong>장바구니가 비어 있습니다.</strong><p>공연을 선택하고 원하는 좌석을 담아보세요.</p></div>
    return <div className="cart-list">{items.map((item) => <article className="cart-item" key={item.seatId}><div><span className="eyebrow">SEAT {item.seatLabel || item.seatId}</span><h2>{item.concertName || '공연 좌석'}</h2><p>좌석 {item.seatLabel || item.seatId}</p></div><button className="remove-button" disabled={removingSeatId === item.seatId} onClick={() => onRemove(item)}>{removingSeatId === item.seatId ? '삭제 중...' : '삭제'}</button></article>)}</div>
}

export default CartList
