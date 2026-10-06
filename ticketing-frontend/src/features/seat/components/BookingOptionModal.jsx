function BookingOptionModal({ seat, onClose, onCart, onPayment, submitting }) {
    return <div className="booking-options"><div className="booking-options-panel"><button className="modal-close" disabled={submitting} onClick={onClose} aria-label="장바구니에 담고 닫기">×</button><span className="eyebrow">SEAT {seat.seatLabel}</span><h3>어디에 담을까요?</h3><p>선택한 좌석을 장바구니에 담거나 바로 결제를 진행할 수 있습니다.</p><div className="booking-options-actions"><button className="option-button" disabled={submitting} onClick={onCart}><strong>장바구니</strong><span>나중에 결제할게요 →</span></button><button className="option-button emphasis" disabled={submitting} onClick={onPayment}><strong>결제하기</strong><span>결제 화면으로 이동 →</span></button></div></div></div>
}

export default BookingOptionModal
