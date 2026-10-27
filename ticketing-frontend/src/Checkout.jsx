import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useEffect, useMemo, useState } from 'react'
import { getErrorMessage } from './shared/api/axiosClient'

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY
const PRICE_PER_SEAT = 50_000

function Checkout({ items, onNotice, onBack }) {
    const [widgets, setWidgets] = useState(null)
    const [ready, setReady] = useState(false)
    const [processing, setProcessing] = useState(false)
    const amount = useMemo(() => items.length * PRICE_PER_SEAT, [items.length])

    useEffect(() => {
        let mounted = true
        async function initialize() {
            if (!clientKey) {
                onNotice('error', '토스 결제 클라이언트 키가 설정되지 않았습니다.')
                return
            }
            try {
                const tossPayments = await loadTossPayments(clientKey)
                if (mounted) setWidgets(tossPayments.widgets({ customerKey: 'ANONYMOUS' }))
            } catch (error) {
                if (mounted) onNotice('error', getErrorMessage(error))
            }
        }
        initialize()
        return () => { mounted = false }
    }, [onNotice])

    useEffect(() => {
        if (!widgets) return
        let mounted = true
        async function renderWidgets() {
            try {
                await widgets.setAmount({ currency: 'KRW', value: amount })
                await Promise.all([
                    widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
                    widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
                ])
                if (mounted) setReady(true)
            } catch (error) {
                if (mounted) onNotice('error', getErrorMessage(error))
            }
        }
        renderWidgets()
        return () => { mounted = false }
    }, [widgets, amount, onNotice])

    const pay = async () => {
        if (!widgets || !ready || processing) return
        setProcessing(true)
        try {
            const orderId = crypto.randomUUID()
            sessionStorage.setItem('ticketing.pending-seat-ids', JSON.stringify(items.map((item) => item.seatId)))
            await widgets.requestPayment({
                orderId,
                orderName: items.length === 1 ? '공연 좌석 1개' : `공연 좌석 ${items.length}개`,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            })
        } catch (error) {
            onNotice('error', getErrorMessage(error))
            setProcessing(false)
        }
    }

    return <section className="payment-section ios-payment-page"><div className="payment-card">
        <div className="payment-header">
            <div className="payment-icon" aria-hidden="true"></div>
            <span className="eyebrow">SECURE CHECKOUT</span>
            <h1>결제를<br /><em>완료해주세요.</em></h1>
            <p className="payment-subtitle">선택하신 좌석을 안전하게 예약합니다.</p>
        </div>
        <div className="payment-order-card">
            <div className="payment-order-title"><span>주문 내역</span><strong>{items.length}개 좌석</strong></div>
            <div className="payment-items">{items.map((item) => <div key={item.seatId}><span>{item.concertName || '공연 좌석'}</span><strong>좌석 {item.seatLabel || item.seatId}</strong></div>)}</div>
            <div className="payment-total"><span>총 결제 금액</span><strong>{amount.toLocaleString()}원</strong></div>
        </div>
        <div className="payment-widget-shell">
            <div className="payment-widget-label">결제 수단</div>
            <div id="payment-method" />
            <div id="agreement" />
        </div>
        <button className="payment-submit-button" disabled={!ready || processing} onClick={pay}>{processing ? '결제창을 준비 중...' : `${amount.toLocaleString()}원 결제하기`}<span>›</span></button>
        <button className="payment-back-button" onClick={onBack}>장바구니로 돌아가기</button>
        <p className="payment-secure-note"><span>􀎡</span> 토스페이먼츠로 안전하게 결제됩니다.</p>
    </div></section>
}

export default Checkout
