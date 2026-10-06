import { useEffect, useState } from 'react'
import { getConcerts } from '../api/concertApi'

export function useConcerts() {
    const [concerts, setConcerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const load = () => { setLoading(true); getConcerts().then((data) => setConcerts(Array.isArray(data) ? data : [])).catch(() => setError('공연 목록을 불러오지 못했습니다.')).finally(() => setLoading(false)) }
    useEffect(load, [])
    return { concerts, loading, error, reload: load }
}
