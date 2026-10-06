import { useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../shared/api/axiosClient'

function SocialCallbackPage({ onComplete, onError }) {
    const [processing, setProcessing] = useState(true)
    const started = useRef(false)

    useEffect(() => {
        if (started.current) return
        started.current = true
        onComplete().then(() => {
            window.location.replace('/')
        }).catch((error) => {
            setProcessing(false)
            onError(getErrorMessage(error))
        })
    }, [onComplete, onError])

    return <section className="loading-state">{processing ? '소셜 로그인 처리 중...' : <><strong>소셜 로그인에 실패했습니다.</strong><p>로그인 화면에서 다시 시도해주세요.</p></>}</section>
}

export default SocialCallbackPage
