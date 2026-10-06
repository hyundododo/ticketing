function CartSummary({ count, onPay, disabled }) {
    return <div className="cart-summary"><span><strong>{count}개</strong>의 좌석</span><button className="dark-button" disabled={disabled} onClick={onPay}>결제하기 →</button></div>
}

export default CartSummary
