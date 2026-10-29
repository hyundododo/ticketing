import { useEffect, useState } from 'react'

export function getHoldTime(heldUntil, now) {
    if (!heldUntil || !now) return null

    const expiryTime = new Date(String(heldUntil).replace(' ', 'T')).getTime()
    if (Number.isNaN(expiryTime)) return null

    const remainingSeconds = Math.max(0, Math.ceil((expiryTime - now) / 1000))
    return {
        expired: remainingSeconds === 0,
        label: `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`,
    }
}

function CartList({ items, selectedSeatIds, onSelect, onRemove, removingSeatId, now: currentTime }) {
    const [now, setNow] = useState(currentTime === undefined ? null : currentTime)

    useEffect(() => {
        if (currentTime !== undefined) {
            setNow(currentTime)
            return undefined
        }
        const updateTime = () => setNow(Date.now())
        updateTime()
        const timer = window.setInterval(updateTime, 1000)
        return () => window.clearInterval(timer)
    }, [currentTime])

    if (!items.length) return <div className="empty-state"><strong>장바구니가 비어 있습니다.</strong><p>공연을 선택하고 원하는 좌석을 담아보세요.</p></div>
    return <div className="cart-list">{items.map((item) => {
        const holdTime = getHoldTime(item.heldUntil, now)
        const selected = selectedSeatIds.includes(item.seatId)
        const expired = holdTime?.expired
        return <article className={`cart-item ${selected ? 'selected' : ''} ${expired ? 'expired' : ''}`} key={item.seatId} onClick={() => !expired && onSelect(item.seatId)}><label className="cart-select" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selected} disabled={expired} onChange={() => onSelect(item.seatId)} aria-label={`${item.seatLabel || item.seatId} 좌석 선택`} /><span className="cart-radio" /></label><div className="cart-item-info"><span className="eyebrow">SEAT {item.seatLabel || item.seatId}</span><h2>{item.concertName || '공연 좌석'}</h2><p>좌석 {item.seatLabel || item.seatId}</p><div className="hold-notice"><span className="hold-dot" />10분 안에 결제하지 않으면 자동 취소됩니다.</div>{holdTime && <div className="hold-countdown" aria-live="polite"><span>{expired ? '결제 시간이 만료되었습니다.' : '결제까지 남은 시간'}</span>{!expired && <strong>{holdTime.label}</strong>}</div>}</div><button className="remove-button" disabled={removingSeatId === item.seatId} onClick={(event) => { event.stopPropagation(); onRemove(item) }}>{removingSeatId === item.seatId ? '삭제 중...' : '삭제'}</button></article>
    })}</div>
}

export default CartList
