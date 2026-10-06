import { useState } from 'react'
import { getErrorMessage } from '../../../shared/api/axiosClient'

function AuthForm({ onSignIn, onRegister, onError }) {
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ username: '', password: '', nickname: '', email: '' })
    const [submitting, setSubmitting] = useState(false)
    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    const submit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        try {
            if (mode === 'login') await onSignIn({ username: form.username, password: form.password })
            else { await onRegister(form); setMode('login'); onError('가입이 완료되었습니다. 로그인해주세요.') }
        } catch (error) { onError(getErrorMessage(error)) } finally { setSubmitting(false) }
    }
    return <section className="auth"><div className="auth-copy"><span className="eyebrow">TICKETING</span><h1>공연을 고르고,<br /><em>좌석을 예약하세요.</em></h1><p>등록된 공연에서 원하는 좌석을 선택해 간편하게 예매할 수 있습니다.</p></div><form className="auth-form" onSubmit={submit}><div className="tabs"><button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => setMode('login')}>로그인</button><button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => setMode('register')}>회원가입</button></div><label className="field"><span>아이디</span><input required name="username" value={form.username} onChange={update} placeholder="아이디" /></label><label className="field"><span>비밀번호</span><input required name="password" type="password" value={form.password} onChange={update} placeholder="비밀번호" /></label>{mode === 'register' && <><label className="field"><span>닉네임</span><input required name="nickname" value={form.nickname} onChange={update} placeholder="닉네임" /></label><label className="field"><span>이메일</span><input required name="email" type="email" value={form.email} onChange={update} placeholder="이메일" /></label></>}<button className="primary-button" disabled={submitting}>{submitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'} <span>→</span></button>{mode === 'login' && <><div className="social-divider"><span>또는 소셜 계정으로 로그인</span></div><div className="social-buttons"><a className="social-button naver" href="/oauth2/authorization/naver">네이버 로그인</a><a className="social-button google" href="/oauth2/authorization/google">Google 로그인</a></div></>}</form></section>
}

export default AuthForm
