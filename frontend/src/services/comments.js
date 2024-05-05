import axios from 'axios'
const baseUrl = '/api/projects'
import { getToken } from './tokenmanager'


const getAll = (projectId, issueId) => {
  const request = axios.get(`${baseUrl}/${projectId}/issues/${issueId}/comments`)
  return request.then(response => response.data)
}

const create = async (projectId, issueId, formData) => {
  const token = getToken()
  const config = {
    headers: {
      Authorization: token,
      'Content-Type': 'multipart/form-data',
    },
  }

  const response = await axios.post(`${baseUrl}/${projectId}/issues/${issueId}/comments`, formData, config)
  return response.data
}

const update = (projectId, issueId, commentId, newObject) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.put(`${baseUrl}/${projectId}/issues/${issueId}/comments/${commentId}`, newObject, config)
  return request.then(response => response.data)
}

const remove = async (projectId, issueId, commentId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.delete(`${baseUrl}/${projectId}/issues/${issueId}/comments/${commentId}`, config)
  return response.data
}

// eslint-disable-next-line
export default { getAll, create, update, remove }