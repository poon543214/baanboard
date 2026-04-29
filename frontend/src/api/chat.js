import client from "./client"

export const getMyChatMessagesApi = async () => {
  const response = await client.get("/chat/messages")
  return response.data
}

export const sendChatMessageApi = async (text) => {
  const response = await client.post("/chat/messages", { text })
  return response.data
}

export const getAllChatMessagesApi = async () => {
  const response = await client.get("/chat/messages/all")
  return response.data
}

export const replyChatMessageApi = async (userId, text) => {
  const response = await client.post(`/chat/messages/${userId}/reply`, { text })
  return response.data
}
