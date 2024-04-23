import axios from 'axios'
const baseUrl = '/api/projects'
import { getToken } from './tokenmanager'


const getAll = (projectId) => {
  const request = axios.get(`${baseUrl}/${projectId}/issues`)
  return request.then(response => response.data)
}

const get = (projectId, issueId) => {
  const request = axios.get(`${baseUrl}/${projectId}/issues/${issueId}`)
  return request.then(response => response.data)
}

const create = async (projectId, newObject) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(`${baseUrl}/${projectId}/issues`, newObject, config)
  return response.data
}

const update = (projectId, issueId, newObject) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.put(`${baseUrl}/${projectId}/issues/${issueId}`, newObject, config)
  return request.then(response => response.data)
}

const remove = async (projectId, issueId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.delete(`${baseUrl}/${projectId}/issues/${issueId}`, config)
  return response.data
}

// eslint-disable-next-line
export default { getAll, get, create, update, remove }