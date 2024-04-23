import axios from 'axios'
const baseUrl = '/api/users'
import { setToken, getToken } from './tokenmanager'

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

const getCreatedIssues = (userId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(`${baseUrl}/${userId}/createdIssues`, config)
  return request.then(response => response.data)
}

const getAssignedIssues = (userId) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(`${baseUrl}/${userId}/assignedIssues`, config)
  return request.then(response => response.data)
}

const getUserFromLocalStorage = () => {
  const userData = localStorage.getItem('loggedProjectappUser')

  if (!userData) {
    return Promise.reject(new Error('No user data found'))
  }

  try {
    const user = JSON.parse(userData)
    setToken(user.token)
    return Promise.resolve(user)
  } catch (error) {
    return Promise.reject(new Error('Failed to parse user data'))
  }
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

const update = (userId, newObject) => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.put(`${baseUrl}/${userId}`, newObject, config)
  return request.then(response => response.data)
}

// eslint-disable-next-line
export default { getAll, getProjects, getCreatedIssues, getAssignedIssues, getUserFromLocalStorage, create, update }