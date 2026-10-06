import axios from 'axios'

const accessTokenKey = 'ticketing.accessToken'
const refreshTokenKey = 'ticketing.refreshToken'

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    withCredentials: true,
})

export const getErrorMessage = (error) => error.response?.data?.message || error.response?.data?.error || error.message || '요청에 실패했습니다.'

let refreshRequest = null

const saveTokens = ({ accessToken, refreshToken }) => {
    localStorage.setItem(accessTokenKey, accessToken)
    if (refreshToken) localStorage.setItem(refreshTokenKey, refreshToken)
}

const clearTokens = () => {
    localStorage.removeItem(accessTokenKey)
    localStorage.removeItem(refreshTokenKey)
}

const refreshAccessToken = () => {
    if (!refreshRequest) {
        const refreshToken = localStorage.getItem(refreshTokenKey)
        if (!refreshToken) return Promise.reject(new Error('Refresh token is missing.'))
        refreshRequest = axios.post('/jwt/refresh', { refreshToken }, { baseURL: import.meta.env.VITE_API_BASE_URL || '', withCredentials: true })
            .then(({ data }) => {
                saveTokens(data)
                return data.accessToken
            })
            .finally(() => { refreshRequest = null })
    }
    return refreshRequest
}

apiClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem(accessTokenKey)
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
})

apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config
    if (error.response?.status !== 401 || originalRequest?._retry || originalRequest?.url === '/jwt/refresh') {
        return Promise.reject(error)
    }
    originalRequest._retry = true
    try {
        const accessToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
    } catch {
        clearTokens()
        return Promise.reject(error)
    }
})
