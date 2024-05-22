import axios from 'axios'
const baseUrl = '/api/projects'
import { getToken } from './tokenmanager'


const getAll = () => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(baseUrl, config)
  return request.then(response => response.data)
}

const get = (projectId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(`${baseUrl}/${projectId}`, config)
  return request.then(response => response.data)
}
const create = async newObject => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = (id, newObject) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.put(`${baseUrl}/${id}`, newObject, config)
  return request.then(response => response.data)
}

const remove = async (id) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response.data
}

// eslint-disable-next-line
export default { getAll, get, create, update, remove }