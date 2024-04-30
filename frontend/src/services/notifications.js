import axios from 'axios'
const baseUrl = '/api/notifications'
import { getToken } from './tokenmanager'


const getAll = () => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(baseUrl, config)
  return request.then(response => response.data)
}

const get = () => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(baseUrl, config)
  return request.then(response => response.data)
}

const create = async (projectId, newObject) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = (notiId, newObject) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.put(`${baseUrl}/${notiId}`, newObject, config)
  return request.then(response => response.data)
}

const remove = async (notiId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.delete(`${baseUrl}/${notiId}`, config)
  return response.data
}

// eslint-disable-next-line
export default { getAll, get, create, update, remove }