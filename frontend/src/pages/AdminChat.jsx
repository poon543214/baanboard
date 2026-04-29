import { useEffect, useMemo, useRef, useState } from "react"
import { getAllChatMessagesApi, replyChatMessageApi } from "../api/chat"

export default function AdminChat() {
  const [messages, setMessages] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const listRef = useRef(null)

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await getAllChatMessagesApi()
      setMessages(data)
      setError("")
    } catch (err) {
      setError(err?.response?.data?.message || "Cannot load chat messages")
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const intervalId = setInterval(() => fetchMessages(true), 5000)
    return () => clearInterval(intervalId)
  }, [])

  const users = useMemo(() => {
    const userMap = new Map()
    messages.forEach((message) => {
      if (!message.user?._id) return
      if (!userMap.has(message.user._id)) {
        userMap.set(message.user._id, message.user)
      }
    })
    return Array.from(userMap.values())
  }, [messages])

  useEffect(() => {
    if (selectedUserId) return
    if (users.length > 0) setSelectedUserId(users[0]._id)
  }, [users, selectedUserId])

  const selectedMessages = useMemo(() => {
    if (!selectedUserId) return []
    return messages.filter((message) => {
      const userId = typeof message.user === "string" ? message.user : message.user?._id
      return userId === selectedUserId
    })
  }, [messages, selectedUserId])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [selectedMessages, selectedUserId])

  const handleReply = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !selectedUserId || sending) return

    try {
      setSending(true)
      const newMessage = await replyChatMessageApi(selectedUserId, text)
      const selectedUser = users.find((item) => item._id === selectedUserId)
      setMessages((prev) => [...prev, { ...newMessage, user: selectedUser || newMessage.user }])
      setDraft("")
      setError("")
    } catch (err) {
      setError(err?.response?.data?.message || "Cannot send reply")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-[91vh] bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Admin Chat Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all contact conversations here</p>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading chats...</p>
        ) : (
          <div className="grid grid-cols-12 min-h-[520px]">
            <aside className="col-span-4 border-r bg-gray-50">
              <div className="p-3 border-b bg-white">
                <h2 className="text-sm font-medium text-gray-700">Conversations</h2>
              </div>
              {users.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No messages yet.</p>
              ) : (
                <div className="divide-y">
                  {users.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => setSelectedUserId(item._id)}
                      className={`w-full text-left p-4 hover:bg-white transition ${
                        selectedUserId === item._id ? "bg-white" : ""
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-800">{item.fullname}</p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <section className="col-span-8 flex flex-col">
              <div ref={listRef} className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
                {!selectedUserId ? (
                  <p className="text-sm text-gray-500">Select a conversation.</p>
                ) : selectedMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages in this conversation.</p>
                ) : (
                  selectedMessages.map((message) => {
                    const isAdmin = message.senderRole === "admin"
                    return (
                      <div key={message._id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isAdmin ? "bg-primary text-white" : "bg-white border text-gray-700"
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className={`mt-1 text-[11px] ${isAdmin ? "text-white/80" : "text-gray-400"}`}>
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={handleReply} className="border-t p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={selectedUserId ? "Reply message..." : "Select user first"}
                    disabled={!selectedUserId}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim() || !selectedUserId}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
                {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
