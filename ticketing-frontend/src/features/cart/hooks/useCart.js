import { useCallback, useEffect, useState } from 'react'
import { addCartItem, getCartItems, releaseCartItem } from '../api/cartApi'
import { getRememberedSeatLabel } from '../../seat/seatLabel'

export function useCart(enabled = true) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const load = useCallback(() => { setLoading(true); getCartItems().then((data) => setItems(Array.isArray(data) ? data.map((item) => ({ ...item, seatLabel: item.seatLabel || getRememberedSeatLabel(item.seatId) })) : [])).catch(() => setError('장바구니를 불러오지 못했습니다.')).finally(() => setLoading(false)) }, [])
    useEffect(() => { if (enabled) load(); else setLoading(false) }, [enabled, load])
    const add = async (item) => { await addCartItem(item.seatId); setItems((current) => current.some((entry) => entry.seatId === item.seatId) ? current : [...current, item]) }
    const remove = async (item) => { await releaseCartItem(item.seatId); setItems((current) => current.filter((entry) => entry.seatId !== item.seatId)) }
    return { items, loading, error, add, remove, reload: load }
}
