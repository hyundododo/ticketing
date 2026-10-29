import { useEffect, useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import CartList, { getHoldTime } from '../features/cart/components/CartList'
import CartSummary from '../features/cart/components/CartSummary'
import { useCart } from '../features/cart/hooks/useCart'

function CartPage({ onNotice, onPay }) {
    const { items, loading, error, remove, reload } = useCart()
    const [removingSeatId, setRemovingSeatId] = useState(null)
    const [selectedSeatIds, setSelectedSeatIds] = useState([])
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000)
        return () => window.clearInterval(timer)
    }, [])
    useEffect(() => {
        setSelectedSeatIds((current) => current.filter((seatId) => items.some((item) => {
            const holdTime = getHoldTime(item.heldUntil, now)
            return item.seatId === seatId && !holdTime?.expired
        })))
    }, [items, now])
    const removeItem = async (item) => { setRemovingSeatId(item.seatId); try { await remove(item); onNotice('success', '장바구니에서 좌석을 삭제했습니다.') } catch (requestError) { onNotice('error', getErrorMessage(requestError)); reload() } finally { setRemovingSeatId(null) } }
    const activeItems = items.filter((item) => !getHoldTime(item.heldUntil, now)?.expired)
    const selectedItems = activeItems.filter((item) => selectedSeatIds.includes(item.seatId))
    const toggleSeat = (seatId) => setSelectedSeatIds((current) => current.includes(seatId) ? current.filter((id) => id !== seatId) : [...current, seatId])
    const toggleAll = () => setSelectedSeatIds((current) => current.length === activeItems.length ? [] : activeItems.map((item) => item.seatId))
    return <section className="cart-section"><div className="page-header"><div><span className="eyebrow">TICKETING</span><h1>장바구니</h1></div><button className="text-button" onClick={reload}>새로고침</button></div>{loading ? <div className="loading-state">장바구니를 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={reload}>다시 시도</button></div> : <><div className="cart-selection-toolbar"><p className="cart-selection-hint">결제할 좌석을 선택하세요.</p><button className="outline-button" disabled={!activeItems.length} onClick={toggleAll}>{selectedItems.length === activeItems.length ? '전체 선택 해제' : '전체 선택'}</button></div><CartList items={items} selectedSeatIds={selectedSeatIds} onSelect={toggleSeat} onRemove={removeItem} removingSeatId={removingSeatId} now={now} /><CartSummary count={activeItems.length} selectedCount={selectedItems.length} disabled={!selectedItems.length} onPay={() => onPay(selectedItems)} /></>}</section>
}

export default CartPage
