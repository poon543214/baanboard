import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { getMyChatMessagesApi, sendChatMessageApi } from "../api/chat"

export default function Contact() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const listRef = useRef(null)

  const username = useMemo(() => user?.fullname || user?.email || "User", [user])

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await getMyChatMessagesApi()
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

    const intervalId = setInterval(() => {
      fetchMessages(true)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    try {
      setSending(true)
      const newMessage = await sendChatMessageApi(text)
      setMessages((prev) => [...prev, newMessage])
      setDraft("")
      setError("")
    } catch (err) {
      setError(err?.response?.data?.message || "Cannot send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-[91vh] bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Contact us chat</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chat directly with admin support. Signed in as {username}
          </p>
        </div>

        <div ref={listRef} className="h-[420px] overflow-y-auto p-4 bg-gray-50 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500">No message yet. Start chatting now.</p>
          ) : (
            messages.map((message) => {
              const isUser = message.senderRole === "user"

              return (
                <div key={message._id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      isUser ? "bg-primary text-white" : "bg-white border text-gray-700"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`mt-1 text-[11px] ${isUser ? "text-white/80" : "text-gray-400"}`}>
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleSend} className="border-t p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
        </form>
      </div>
    </div>
  )
}
