function CartSummary({ count, selectedCount, disabled, onPay }) {
    return <div className="cart-summary"><div className="cart-summary-copy"><strong>{selectedCount ? `${selectedCount}개 선택됨` : '좌석을 선택하세요'}</strong><span>전체 {count}개</span></div><div className="cart-payment-actions"><button className="dark-button" disabled={disabled} onClick={onPay}>결제하기</button></div></div>
}

export default CartSummary
