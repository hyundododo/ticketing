import { apiClient } from '../../../shared/api/axiosClient'

export const getConcerts = async () => (await apiClient.get('/api/concerts')).data
export const createConcert = async (payload) => (await apiClient.post('/api/concerts', payload)).data
export const deleteConcert = async (concertId) => (await apiClient.delete(`/api/concerts/${concertId}`)).data
