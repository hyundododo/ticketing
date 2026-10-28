import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiClient, getErrorMessage } from './shared/api/axiosClient'
import { confirmSeat, createTicket, removePurchasedCartItem } from './features/seat/api/ticketApi'

export function SuccessPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [message, setMessage] = useState('결제를 승인하는 중입니다...')

    useEffect(() => {
        let active = true
        async function confirm() {
            try {
                const amount = Number(searchParams.get('amount'))
                await apiClient.post('/confirm', {
                    orderId: searchParams.get('orderId'),
                    amount: String(amount),
                    paymentKey: searchParams.get('paymentKey'),
                })
                const seatIds = JSON.parse(sessionStorage.getItem('ticketing.pending-seat-ids') || '[]')
                sessionStorage.removeItem('ticketing.pending-seat-ids')
                for (const seatId of seatIds) {
                    await confirmSeat(seatId)
                    await createTicket(seatId)
                    await removePurchasedCartItem(seatId)
                }
                if (active) setMessage('결제가 완료되었습니다.')
            } catch (error) {
                if (active) {
                    const text = getErrorMessage(error)
                    navigate(`/payment/fail?message=${encodeURIComponent(text)}&code=CONFIRM_FAILED`, { replace: true })
                }
            }
        }
        confirm()
        return () => { active = false }
    }, [navigate, searchParams])

    const completed = message === '결제가 완료되었습니다.'
    return <div className="result wrapper ios-result-page"><div className={`success-card ${completed ? 'is-complete' : ''}`}>
        <div className="success-icon" aria-hidden="true">{completed ? '✓' : <span className="success-spinner" />}</div>
        <span className="eyebrow">{completed ? 'PAYMENT COMPLETE' : 'PROCESSING PAYMENT'}</span>
        <h1>{completed ? <>결제가<br />완료되었어요.</> : <>결제를<br />확인하고 있어요.</>}</h1>
        <p className="success-description">{completed ? '티켓이 발급되었습니다. 즐거운 관람 되세요!' : message}</p>
        <div className="success-order-info">
            <span>주문번호</span>
            <strong>{searchParams.get('orderId')}</strong>
        </div>
        {completed && <button className="payment-submit-button" onClick={() => navigate('/tickets')}>내 티켓 확인하기 <span>›</span></button>}
        <button className="payment-back-button" onClick={() => navigate('/')}>홈으로 돌아가기</button>
    </div></div>
}
