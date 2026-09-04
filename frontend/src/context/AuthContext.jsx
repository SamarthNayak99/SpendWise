import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'
import { setAuthToken } from '../api/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)  // true while checking stored token

  // On mount: check if there's a stored token and fetch current user
  useEffect(() => {
    const token = localStorage.getItem('sw-token')
    if (token) {
      setAuthToken(token)
      authApi.getMe()
        .then(res => setUser(res.data))
        .catch(() => {
          // Token invalid or expired — clear it
          localStorage.removeItem('sw-token')
          setAuthToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { user: userData, access_token } = res.data
    localStorage.setItem('sw-token', access_token)
    setAuthToken(access_token)
    setUser(userData)
    return userData
  }

  const signup = async (email, username, password) => {
    const res = await authApi.signup({ email, username, password })
    const { user: userData, access_token } = res.data
    localStorage.setItem('sw-token', access_token)
    setAuthToken(access_token)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('sw-token')
    setAuthToken(null)
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
