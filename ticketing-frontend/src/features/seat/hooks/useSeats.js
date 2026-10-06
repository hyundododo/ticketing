import { useCallback, useEffect, useState } from 'react'
import { getSeats } from '../api/seatApi'

export function useSeats(concertId) {
    const [seats, setSeats] = useState([])
    const [loading, setLoading] = useState(Boolean(concertId))
    const [error, setError] = useState('')
    const reload = useCallback(() => { if (!concertId) return; setLoading(true); getSeats(concertId).then((data) => setSeats(Array.isArray(data) ? data : [])).catch(() => setError('좌석 목록을 불러오지 못했습니다.')).finally(() => setLoading(false)) }, [concertId])
    useEffect(() => { reload() }, [reload])
    return { seats, loading, error, reload }
}
