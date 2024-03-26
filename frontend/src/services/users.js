import axios from 'axios'
const baseUrl = '/api/users'
import { getToken } from './tokenmanager'

const getAll = () => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(baseUrl, config)
  return request.then(response => response.data)
}

const getProjects = (userId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(`${baseUrl}/${userId}/projects`, config)
  return request.then(response => response.data)
}

const getIssues = (userId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(`${baseUrl}/${userId}/issues`, config)
  return request.then(response => response.data)
}

const create = async (name, username, password) => {
  const newUser = {
    name: name,
    username: username,
    password: password
  }

  const response = await axios.post(baseUrl, newUser)
  return response.data
}

// eslint-disable-next-line
export default { getAll, getProjects, getIssues, create }