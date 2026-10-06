import { useEffect, useState } from 'react'
import { exchangeSocialLogin, getProfile, login, signup } from '../api/authApi'

const accessTokenKey = 'ticketing.accessToken'
const refreshTokenKey = 'ticketing.refreshToken'

const clearStoredTokens = () => {
    localStorage.removeItem(accessTokenKey)
    localStorage.removeItem(refreshTokenKey)
}

export function useAuth() {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem(accessTokenKey))
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(Boolean(accessToken))
    const [error, setError] = useState('')

    useEffect(() => {
        if (!accessToken) {
            setLoading(false)
            return
        }
        getProfile().then(setProfile).catch((requestError) => {
            if ([401, 403].includes(requestError.response?.status)) {
                clearStoredTokens()
                setAccessToken(null)
                setProfile(null)
                return
            }
            setError(requestError.response?.data?.message || '사용자 정보를 불러오지 못했습니다.')
        }).finally(() => setLoading(false))
    }, [accessToken])

    const signIn = async (credentials) => {
        const tokens = await login(credentials)
        localStorage.setItem(accessTokenKey, tokens.accessToken)
        localStorage.setItem(refreshTokenKey, tokens.refreshToken)
        setAccessToken(tokens.accessToken)
    }

    const register = async (payload) => signup(payload)

    const completeSocialLogin = async () => {
        const tokens = await exchangeSocialLogin()
        localStorage.setItem(accessTokenKey, tokens.accessToken)
        localStorage.setItem(refreshTokenKey, tokens.refreshToken)
        setAccessToken(tokens.accessToken)
    }

    const signOut = () => {
        clearStoredTokens()
        setAccessToken(null)
        setProfile(null)
    }

    return { accessToken, profile, loading, error, signIn, register, completeSocialLogin, signOut }
}
