import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// Attach the logged-in user's token to every outgoing request, so the
// backend's auth middleware can verify who's asking.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the backend ever says the token is missing/invalid/expired, clear the
// stale session and send the user back to Login instead of leaving them
// stuck on a page that will silently fail every request.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default API