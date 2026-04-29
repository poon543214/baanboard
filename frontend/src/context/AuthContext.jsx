import { createContext, useContext, useState, useEffect } from "react"
import Configs from "../config"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(Configs.storage.user)
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Failed to restore user session:", error)
      localStorage.removeItem(Configs.storage.user)
      localStorage.removeItem(Configs.storage.token)
    } finally {
      setIsInitializing(false)
    }
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem(Configs.storage.user, JSON.stringify(userData))
    if (token) {
      localStorage.setItem(Configs.storage.token, token)
    }
  }

  const logout = (reason = null) => {
    setUser(null)
    localStorage.removeItem(Configs.storage.user)
    localStorage.removeItem(Configs.storage.token)
    if (reason) {
      localStorage.setItem("auth_logout_reason", reason)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
