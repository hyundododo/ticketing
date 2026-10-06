import { useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'
import { confirmSeat, createTicket, removePurchasedCartItem } from '../features/seat/api/ticketApi'

function PaymentPage({ items, onNotice, onComplete, onBack }) {
    const [processing, setProcessing] = useState(false)
    const pay = async () => { if (!items.length || processing) return; setProcessing(true); try { for (const item of items) { await confirmSeat(item.seatId); await createTicket(item.seatId); await removePurchasedCartItem(item.seatId) } onNotice('success', `${items.length}개의 티켓이 생성되었습니다.`); onComplete() } catch (requestError) { onNotice('error', getErrorMessage(requestError)) } finally { setProcessing(false) } }
    return <section className="payment-section"><div className="payment-card"><span className="eyebrow">PAYMENT</span><h1>결제 정보를 확인해주세요.</h1><div className="payment-items">{items.length ? items.map((item) => <div key={item.seatId}><span>{item.concertName || '공연 좌석'}</span><strong>좌석 {item.seatLabel || item.seatId}</strong></div>) : <p>결제할 좌석이 없습니다.</p>}</div><div className="payment-placeholder">결제 준비 완료<span>결제하기를 누르면 티켓이 생성됩니다.</span></div><button className="primary-button" disabled={processing || !items.length} onClick={pay}>{processing ? '결제 처리 중...' : '결제하기'} <span>→</span></button><button className="text-button" onClick={onBack}>← 장바구니로 돌아가기</button></div></section>
}

export default PaymentPage
