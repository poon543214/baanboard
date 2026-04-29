import { createContext, useContext, useState, useEffect } from "react"
import Configs from "../config"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const isTokenValid = (token) => {
    if (!token || typeof token !== "string") return false

    const tokenParts = token.split(".")
    if (tokenParts.length !== 3) return false

    try {
      const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/")))
      if (!payload?.exp) return true
      return payload.exp * 1000 > Date.now()
    } catch (error) {
      return false
    }
  }

  const enforceValidSession = () => {
    const token = localStorage.getItem(Configs.storage.token)
    const storedUser = localStorage.getItem(Configs.storage.user)

    if (!storedUser || !token) return
    if (isTokenValid(token)) return

    setUser(null)
    localStorage.removeItem(Configs.storage.user)
    localStorage.removeItem(Configs.storage.token)
    localStorage.setItem("auth_logout_reason", "session_expired")
    if (window.location.pathname !== "/login") {
      window.location.href = "/login"
    }
  }

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

  useEffect(() => {
    const intervalId = setInterval(enforceValidSession, 1500)
    const onFocus = () => enforceValidSession()
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        enforceValidSession()
      }
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [user])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem(Configs.storage.user, JSON.stringify(userData))
    if (token) {
      localStorage.setItem(Configs.storage.token, token)
    }
    localStorage.removeItem("auth_logout_reason")
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
