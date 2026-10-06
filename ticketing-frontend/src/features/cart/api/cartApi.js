import { apiClient } from '../../../shared/api/axiosClient'

export const getCartItems = async () => (await apiClient.get('/api/items')).data
export const addCartItem = async (seatId) => (await apiClient.post('/api/items', { seatId })).data
export const releaseCartItem = async (seatId) => (await apiClient.delete('/api/items/release', { data: { seatId } })).data
export const removePurchasedItem = async (seatId) => (await apiClient.delete('/api/items', { data: { seatId } })).data
