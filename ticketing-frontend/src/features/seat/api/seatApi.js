import { apiClient } from '../../../shared/api/axiosClient'

export const getSeats = async (concertId) => (await apiClient.get(`/api/seats/${concertId}`)).data
export const holdSeat = async (seatId) => (await apiClient.post(`/api/seats/${seatId}/hold`)).data
export const confirmSeat = async (seatId) => (await apiClient.post(`/api/seats/${seatId}/confirm`)).data
