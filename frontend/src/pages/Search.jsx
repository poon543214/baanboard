import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import client from "../api/client"
import Configs from "../config"
import { ThumbsUp, MessageSquare } from "lucide-react"

export default function Search() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const query = new URLSearchParams(location.search)
  const keyword = query.get("q")

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (keyword) {
      fetchSearch()
    }
  }, [keyword])

  const fetchSearch = async () => {
    try {
      setLoading(true)

      const res = await client.get(
        Configs.api.get.post + `?search=${keyword}`
      )

      setPosts(res.data)

    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-xl font-bold mb-2">
        Search result 
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && posts.length === 0 && (
        <p className="text-gray-500 mt-4">No result found</p>
      )}

      <div className="space-y-6 mt-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded shadow p-4 flex gap-6"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-1/4 h-60 object-cover rounded"
            />

            <div className="flex-1">

              <div className="flex justify-between">
                <h3
                  onClick={() => navigate(`/post/${post._id}`)}
                  className="text-teal-600 font-semibold mb-2 cursor-pointer hover:underline"
                >
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600">
                  {post.owner?.fullname} |{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>

              <p className="text-gray-600 h-32 overflow-hidden break-words">
                {post.content}
              </p>

              <div className="flex gap-4 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp size={16} />
                  {post.likeCount}
                </div>

                <div className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  {post.comments?.length}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
