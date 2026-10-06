import { apiClient } from '../../../shared/api/axiosClient'

export const login = async (credentials) => {
    const { data } = await apiClient.post('/login', credentials)
    return data
}

export const signup = async (payload) => {
    const { data } = await apiClient.post('/api/user', payload)
    return data
}

export const getProfile = async () => {
    const { data } = await apiClient.get('/api/user')
    return data
}

export const exchangeSocialLogin = async () => {
    const { data } = await apiClient.post('/jwt/exchange', {})
    return data
}
