import { useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'

function UserPage({ profile, onBack, onUpdateProfile, onDeleteAccount, onNotice }) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ nickname: profile?.nickname || '', email: profile?.email || '' })
    const [submitting, setSubmitting] = useState(false)
    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    const save = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        try {
            await onUpdateProfile({ username: profile.username, ...form })
            setEditing(false)
            onNotice('success', '회원 정보가 수정되었습니다.')
        } catch (error) {
            onNotice('error', getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }
    const remove = async () => {
        if (!window.confirm('회원 탈퇴를 진행하시겠습니까?')) return
        setSubmitting(true)
        try {
            await onDeleteAccount()
        } catch (error) {
            onNotice('error', getErrorMessage(error))
            setSubmitting(false)
        }
    }
    return <section className="user-page">
        <div className="page-header">
            <div><span className="eyebrow">ACCOUNT</span><h1>나의 정보</h1></div>
            <button className="text-button" onClick={onBack}>공연 목록으로</button>
        </div>
        <div className={`profile-card ${editing ? 'is-editing' : ''}`}>
            <div className="profile-avatar" aria-hidden="true">{(profile?.nickname || profile?.username || '?').charAt(0).toUpperCase()}</div>
            {editing ? <form className="profile-details profile-edit-form" onSubmit={save}>
                <div className="profile-heading"><span className="eyebrow">EDIT PROFILE</span><h2>내 정보 수정</h2><p>변경할 내용을 입력해주세요.</p></div>
                <div className="profile-form-fields">
                    <label className="field"><span>닉네임</span><input required name="nickname" value={form.nickname} onChange={update} /></label>
                    <label className="field"><span>이메일</span><input name="email" type="email" value={form.email} onChange={update} /></label>
                </div>
                <div className="profile-actions"><button className="primary-button" disabled={submitting}>{submitting ? '저장 중...' : '변경사항 저장'} <span>→</span></button><button type="button" className="text-button" onClick={() => setEditing(false)} disabled={submitting}>취소</button></div>
            </form> : <div className="profile-details">
                <div className="profile-heading"><span className="eyebrow">PROFILE</span><h2>{profile?.nickname || profile?.username}</h2><p>나의 계정 정보를 확인하고 관리하세요.</p></div>
                <dl>
                    <div><dt>아이디</dt><dd>{profile?.username || '-'}</dd></div>
                    <div><dt>닉네임</dt><dd>{profile?.nickname || '-'}</dd></div>
                    <div><dt>이메일</dt><dd>{profile?.email || '-'}</dd></div>
                    <div><dt>로그인 방식</dt><dd>{profile?.social ? '소셜 로그인' : '일반 로그인'}</dd></div>
                </dl>
            </div>}
            <div className="profile-actions profile-account-actions">
                {!editing && !profile?.social && <button className="dark-button" onClick={() => setEditing(true)}>정보 수정</button>}
                <button className="text-button danger-button" onClick={remove} disabled={submitting}>회원 탈퇴</button>
            </div>
        </div>
    </section>
}

export default UserPage
