function UserPage({ profile, onBack }) {
    return <section className="user-page">
        <div className="page-header">
            <div><span className="eyebrow">ACCOUNT</span><h1>나의 정보</h1></div>
            <button className="text-button" onClick={onBack}>공연 목록으로</button>
        </div>
        <div className="profile-card">
            <div className="profile-avatar" aria-hidden="true">{(profile?.nickname || profile?.username || '?').charAt(0).toUpperCase()}</div>
            <div className="profile-details">
                <span className="eyebrow">PROFILE</span>
                <h2>{profile?.nickname || profile?.username}</h2>
                <dl>
                    <div><dt>아이디</dt><dd>{profile?.username || '-'}</dd></div>
                    <div><dt>이메일</dt><dd>{profile?.email || '-'}</dd></div>
                    <div><dt>로그인 방식</dt><dd>{profile?.social ? '소셜 로그인' : '일반 로그인'}</dd></div>
                </dl>
            </div>
        </div>
    </section>
}

export default UserPage
