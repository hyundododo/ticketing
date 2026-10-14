import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../../shared/api/axiosClient'
import { getWaitingStatus, leaveWaiting } from '../api/waitingApi'

function WaitingModal({ concert, initialRank, onAllowed, onClose, onNotice }) {
    const [rank, setRank] = useState(initialRank)
    const [error, setError] = useState(null)
    const [leaving, setLeaving] = useState(false)

    useEffect(() => {
        let active = true
        const checkStatus = async () => {
            try {
                const response = await getWaitingStatus()
                if (!active) return
                if (response.status === 'ALLOWED') {
                    onAllowed()
                } else if (response.status === 'WAITING') {
                    setRank(response.rank)
                    setError(null)
                } else {
                    setError('대기열 정보를 찾을 수 없습니다. 다시 시도해주세요.')
                }
            } catch (requestError) {
                if (active) setError(getErrorMessage(requestError))
            }
        }
        const intervalId = window.setInterval(checkStatus, 1000)
        return () => {
            active = false
            window.clearInterval(intervalId)
        }
    }, [onAllowed])

    const close = async () => {
        if (leaving) return
        setLeaving(true)
        try {
            await leaveWaiting()
            onClose()
        } catch (requestError) {
            onNotice('error', getErrorMessage(requestError))
            setLeaving(false)
        }
    }

    return <div className="waiting-modal" role="dialog" aria-modal="true" aria-labelledby="waiting-title">
        <section className="waiting-panel">
            <button className="seat-modal-close modal-close" onClick={close} aria-label="대기열 닫기">×</button>
            <span className="eyebrow">WAITING ROOM</span>
            <h2 id="waiting-title">{concert.concertName || concert.name}</h2>
            {error ? <div className="empty-state"><strong>{error}</strong><p>잠시 후 자동으로 다시 확인합니다.</p></div> : <><p className="waiting-description">현재 접속자가 많아 대기열에 등록되었습니다.</p><div className="waiting-rank"><span>내 대기 순서</span><strong>{rank ?? '-'}<small>번째</small></strong></div><p className="small-note">입장이 가능해지면 좌석 선택 화면으로 자동 이동합니다.</p></>}
            <button className="text-button waiting-cancel" onClick={close} disabled={leaving}>{leaving ? '나가는 중...' : '대기열 나가기'}</button>
        </section>
    </div>
}

export default WaitingModal
