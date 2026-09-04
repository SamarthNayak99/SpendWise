import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Axios instance — all API calls go through this.
 * Base URL is set from VITE_API_URL environment variable.
 */
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Set or clear the Authorization header for all subsequent requests.
 * Called by AuthContext on login/logout.
 */
export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete client.defaults.headers.common['Authorization']
  }
}

/**
 * Response interceptor — handle global errors.
 * On 401: clear token and redirect to /login.
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sw-token')
      setAuthToken(null)
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
