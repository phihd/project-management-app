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
export default { getAll, getProjects, getCreatedIssues, getAssignedIssues, create, update }