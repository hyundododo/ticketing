import { useEffect, useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import CartList from '../features/cart/components/CartList'
import CartSummary from '../features/cart/components/CartSummary'
import { useCart } from '../features/cart/hooks/useCart'

function CartPage({ onNotice, onPay }) {
    const { items, loading, error, remove, reload } = useCart()
    const [removingSeatId, setRemovingSeatId] = useState(null)
    const [selectedSeatIds, setSelectedSeatIds] = useState([])
    useEffect(() => {
        setSelectedSeatIds((current) => current.filter((seatId) => items.some((item) => item.seatId === seatId)))
    }, [items])
    const removeItem = async (item) => { setRemovingSeatId(item.seatId); try { await remove(item); onNotice('success', '장바구니에서 좌석을 삭제했습니다.') } catch (requestError) { onNotice('error', getErrorMessage(requestError)); reload() } finally { setRemovingSeatId(null) } }
    const selectedItems = items.filter((item) => selectedSeatIds.includes(item.seatId))
    const toggleSeat = (seatId) => setSelectedSeatIds((current) => current.includes(seatId) ? current.filter((id) => id !== seatId) : [...current, seatId])
    return <section className="cart-section"><div className="page-header"><div><span className="eyebrow">TICKETING</span><h1>장바구니</h1></div><button className="text-button" onClick={reload}>새로고침</button></div>{loading ? <div className="loading-state">장바구니를 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={reload}>다시 시도</button></div> : <><p className="cart-selection-hint">결제할 좌석을 여러 개 선택하거나 전체 좌석을 한 번에 결제하세요.</p><CartList items={items} selectedSeatIds={selectedSeatIds} onSelect={toggleSeat} onRemove={removeItem} removingSeatId={removingSeatId} /><CartSummary count={items.length} selectedCount={selectedItems.length} selectedDisabled={!selectedItems.length} allDisabled={!items.length} onPaySelected={() => onPay(selectedItems)} onPayAll={() => onPay(items)} /></>}</section>
}

export default CartPage
