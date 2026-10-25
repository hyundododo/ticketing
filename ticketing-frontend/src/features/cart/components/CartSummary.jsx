function CartSummary({ count, selectedCount, selectedDisabled, allDisabled, onPaySelected, onPayAll }) {
    return <div className="cart-summary"><div className="cart-summary-copy"><strong>{selectedCount ? `${selectedCount}개 선택됨` : '좌석을 선택하세요'}</strong><span>전체 {count}개</span></div><div className="cart-payment-actions"><button className="outline-button" disabled={selectedDisabled} onClick={onPaySelected}>선택 결제</button><button className="dark-button" disabled={allDisabled} onClick={onPayAll}>전체 결제</button></div></div>
}

export default CartSummary
