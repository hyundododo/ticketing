import { useEffect, useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import { cancelSeat, deleteTicket, getTickets } from '../features/seat/api/ticketApi'
import { getRememberedSeatLabel } from '../features/seat/seatLabel'

function TicketsPage({ concerts, onNotice }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deletingTicketId, setDeletingTicketId] = useState(null)
    const load = () => { setLoading(true); getTickets().then((data) => setTickets(Array.isArray(data) ? data : [])).catch((requestError) => { setError(getErrorMessage(requestError)); onNotice('error', getErrorMessage(requestError)) }).finally(() => setLoading(false)) }
    const remove = async (ticket) => {
        if (deletingTicketId || !window.confirm('티켓을 삭제하고 좌석을 취소하시겠습니까?')) return
        setDeletingTicketId(ticket.id)
        try {
            await deleteTicket(ticket.id)
            await cancelSeat(ticket.seatId)
            setTickets((currentTickets) => currentTickets.filter((currentTicket) => currentTicket.id !== ticket.id))
            onNotice('success', '티켓이 삭제되고 좌석이 취소되었습니다.')
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
            load()
        } finally {
            setDeletingTicketId(null)
        }
    }
    useEffect(load, [])
    return <section className="ticket-list"><div className="page-header"><div><span className="eyebrow">TICKETING</span><h1>나의 티켓</h1></div><button className="text-button" onClick={load}>새로고침</button></div>{loading ? <div className="loading-state">티켓을 불러오는 중...</div> : error ? <div className="empty-state"><strong>{error}</strong><button className="text-button" onClick={load}>다시 시도</button></div> : !tickets.length ? <div className="empty-state"><strong>예매한 티켓이 없습니다.</strong><p>공연을 선택하고 좌석을 예매해보세요.</p></div> : tickets.map((ticket) => { const concert = concerts.find((item) => item.id === ticket.concertId); const seatLabel = ticket.seatLabel || getRememberedSeatLabel(ticket.seatId) || '좌석'; const deleting = deletingTicketId === ticket.id; return <article className="ticket-card" key={ticket.id}><div><span className="eyebrow">TICKET #{ticket.id}</span><h2>{concert?.concertName || `콘서트 #${ticket.concertId}`}</h2><p>좌석 <strong>{seatLabel}</strong></p></div><div className="ticket-card-actions"><time>{ticket.createdDate ? new Date(ticket.createdDate).toLocaleString('ko-KR') : '예매 완료'}</time><button className="delete-concert" disabled={Boolean(deletingTicketId)} onClick={() => remove(ticket)}>{deleting ? '삭제 중...' : '티켓 삭제'}</button></div></article> })}</section>
}

export default TicketsPage
