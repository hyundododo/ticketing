import { apiClient } from '../../../shared/api/axiosClient'

export const confirmSeat = async (seatId) => (await apiClient.post(`/api/seats/${seatId}/confirm`)).data
export const createTicket = async (seatId) => (await apiClient.post(`/api/tickets/${seatId}`)).data
export const removePurchasedCartItem = async (seatId) => (await apiClient.delete('/api/items', { data: { seatId } })).data
export const getTickets = async () => (await apiClient.get('/api/tickets')).data
export const deleteTicket = async (ticketId) => (await apiClient.delete(`/api/tickets/${ticketId}`)).data
export const cancelSeat = async (seatId) => (await apiClient.post(`/api/seats/${seatId}/cancel`)).data
