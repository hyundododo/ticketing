import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useEffect, useMemo, useState } from 'react'
import { getErrorMessage } from './shared/api/axiosClient'

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY

function Checkout({ items, onNotice, onBack }) {
    const [widgets, setWidgets] = useState(null)
    const [ready, setReady] = useState(false)
    const [processing, setProcessing] = useState(false)
    const amount = useMemo(() => items.reduce((total, item) => total + Number(item.price || 0), 0), [items])

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
        const seatIds = items.map((item) => item?.seatId).filter((seatId) => seatId != null)
        if (seatIds.length !== items.length || !seatIds.length) {
            onNotice('error', '선택한 좌석 정보를 확인할 수 없습니다. 좌석을 다시 선택해주세요.')
            return
        }
        setProcessing(true)
        try {
            const orderId = crypto.randomUUID()
            sessionStorage.setItem('ticketing.pending-seat-ids', JSON.stringify(seatIds))
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
            <h1>결제를<br /><em>완료해주세요.</em></h1>
        </div>
        <div className="payment-order-card">
            <div className="payment-order-title"><span>주문 내역</span><strong>{items.length}개 좌석</strong></div>
            <div className="payment-items">{items.map((item) => <div key={item.seatId}><span>{item.concertName || '공연 좌석'} · 좌석 {item.seatLabel || item.seatId}</span><strong>{Number(item.price || 0).toLocaleString()}원</strong></div>)}</div>
            <div className="payment-total"><span>총 결제 금액</span><strong>{amount.toLocaleString()}원</strong></div>
        </div>
        <div className="payment-widget-shell">
            <div id="payment-method" />
            <div id="agreement" />
        </div>
        <button className="payment-submit-button" disabled={!ready || processing} onClick={pay}>{processing ? '결제창을 준비 중...' : `${amount.toLocaleString()}원 결제하기`}<span>›</span></button>
        <button className="payment-back-button" onClick={onBack}>장바구니로 돌아가기</button>
    </div></section>
}

export default Checkout
