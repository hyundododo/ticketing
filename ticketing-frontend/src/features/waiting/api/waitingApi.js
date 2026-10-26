import { apiClient } from '../../../shared/api/axiosClient'

export const enterWaiting = async (concertId) => (await apiClient.post('/waiting/enter', null, { params: { concertId } })).data
export const getWaitingStatus = async (concertId) => (await apiClient.get('/waiting/status', { params: { concertId } })).data
export const leaveWaiting = async (concertId) => (await apiClient.delete('/waiting/delete', { params: { concertId } })).data
