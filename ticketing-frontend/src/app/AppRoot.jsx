import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import '../App.css'
import AppLayout from '../shared/layout/AppLayout'
import AuthPage from '../pages/AuthPage'
import CartPage from '../pages/CartPage'
import ConcertPage from '../pages/ConcertPage'
import PaymentPage from '../pages/PaymentPage'
import SocialCallbackPage from '../pages/SocialCallbackPage'
import TicketsPage from '../pages/TicketsPage'
import UserPage from '../pages/UserPage'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useCart } from '../features/cart/hooks/useCart'

function isAdminToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return (payload.role || payload.authorities?.[0] || '').includes('ADMIN')
    } catch {
        return false
    }
}

function InvalidLoginPath() {
    const navigate = useNavigate()
    return <AppLayout><section className="empty-state"><h1>잘못된 요청입니다.</h1><p>로그인 화면은 홈페이지에서 이용해주세요.</p><button className="primary-button" onClick={() => navigate('/')}>홈으로 이동</button></section></AppLayout>
}

function AuthenticatedApp() {
    const { accessToken, profile, loading: authLoading, signIn, register, completeSocialLogin, signOut } = useAuth()
    const { items, add, reload: reloadCart } = useCart(Boolean(accessToken && profile))
    const [notice, setNotice] = useState(null)
    const [paymentItems, setPaymentItems] = useState([])
    const navigate = useNavigate()
    const location = useLocation()
    const notify = (type, message) => setNotice({ type, message })
    if (authLoading) return <AppLayout notice={notice} setNotice={setNotice}><div className="loading-state">사용자 정보를 확인하는 중...</div></AppLayout>
    if (location.pathname === '/cookie') return <AppLayout notice={notice} setNotice={setNotice}><SocialCallbackPage onComplete={completeSocialLogin} onError={(message) => notify('error', message)} /></AppLayout>
    if (!accessToken) return <AppLayout notice={notice} setNotice={setNotice}><AuthPage onSignIn={signIn} onRegister={register} onError={(message) => notify('error', message)} /></AppLayout>
    const cartItems = paymentItems.length ? paymentItems : items
    const navigateToPayment = (selectedItems) => { setPaymentItems(selectedItems); navigate('/payment') }
    const completePayment = () => { setPaymentItems([]); reloadCart(); navigate('/tickets') }
    const page = <Routes><Route path="/" element={<ConcertPage isAdmin={isAdminToken(accessToken)} onNotice={notify} onCart={async (item) => { await add(item); navigate('/cart') }} onPayment={(item) => navigateToPayment([item])} />} /><Route path="/cart" element={<CartPage onNotice={notify} onPay={navigateToPayment} />} /><Route path="/payment" element={<PaymentPage items={cartItems} onNotice={notify} onComplete={completePayment} onBack={() => navigate('/cart')} />} /><Route path="/tickets" element={<TicketsPage concerts={[]} onNotice={notify} />} /><Route path="/user" element={<UserPage profile={profile} onBack={() => navigate('/')} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
    const appLayoutProps = { notice, setNotice, profile, onProfile: () => navigate('/user'), onSignOut: () => { signOut(); navigate('/') } }
    return <AppLayout {...appLayoutProps}><nav className="page-actions app-navigation" aria-label="주요 메뉴"><button className={`text-button ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>공연 목록</button><button className={`text-button ${location.pathname === '/cart' ? 'active' : ''}`} onClick={() => navigate('/cart')}>장바구니</button><button className={`text-button ${location.pathname === '/tickets' ? 'active' : ''}`} onClick={() => navigate('/tickets')}>나의 티켓</button></nav>{page}</AppLayout>
}

function ProtectedApp() {
    const location = useLocation()
    if (location.pathname === '/login') return <InvalidLoginPath />
    return <AuthenticatedApp />
}

export default ProtectedApp
