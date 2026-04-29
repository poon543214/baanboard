import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute() {
  const { user, isInitializing } = useAuth()

  if (isInitializing) {
    return <div className="p-10 text-gray-500">Loading session...</div>
  }

  if (!user) return <Navigate to="/login" />

  return <Outlet />
}
