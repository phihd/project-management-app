import axios from 'axios'
const baseUrl = '/api'
import { getToken } from './tokenmanager'

const getAll = () => {
  const token = getToken()
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.get(baseUrl, config)
  return request.then(response => response.data)
}

// eslint-disable-next-line
export default { getAll }