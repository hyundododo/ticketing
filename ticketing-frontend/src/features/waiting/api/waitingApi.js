import { apiClient } from '../../../shared/api/axiosClient'

export const enterWaiting = async () => (await apiClient.post('/waiting/enter')).data
export const getWaitingStatus = async () => (await apiClient.get('/waiting/status')).data
export const leaveWaiting = async () => (await apiClient.delete('/waiting/delete')).data
