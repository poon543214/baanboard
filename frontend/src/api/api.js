import client from "./client"
import Configs from "../config"

// Auth APIs
export const loginApi = async (email, password) => {
  const response = await client.post(Configs.api.auth.login, {
    email,
    password,
  })
  return response.data
}

// Post APIs
export const getPostsApi = async () => {
  const response = await client.get(Configs.api.get.post)
  return response.data
}

export const getMyPostsApi = async () => {
  const response = await client.get(Configs.api.get.mypost)
  return response.data
}
