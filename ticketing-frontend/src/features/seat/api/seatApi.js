import { apiClient } from '../../../shared/api/axiosClient'

export const getSeats = async (concertId) => (await apiClient.get(`/api/concerts/${concertId}/seats`)).data
export const holdSeat = async (concertId, seatId) => (await apiClient.post(`/api/concerts/${concertId}/seats/${seatId}/hold`, { seatId })).data
export const confirmSeat = async (seatId) => (await apiClient.post(`/api/seats/${seatId}/confirm`)).data
