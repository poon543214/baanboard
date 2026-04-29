import client from "./client"

export const getAdminDashboardApi = async () => {
  const response = await client.get("/admin/dashboard")
  return response.data
}
