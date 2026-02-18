import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { getMyPostsApi } from "../api/api"
import { ThumbsUp, MessageSquare } from "lucide-react"

export default function Post() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getMyPostsApi()
        setPosts(data)
      } catch (err) {
        console.error("Fetch post error:", err)
      }
    }

    fetchPosts()
  }, [])

  // เรียงลำดับ posts จากใหม่ไปเก่า
  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  }, [posts])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Posts
        </h1>

        <div className="space-y-6">
          {sortedPosts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No posts available
            </p>
          ) : (
            sortedPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded shadow p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-teal-600 mb-1">
                      {post.title}
                    </h2>
                    {post.tag && (
                      <span className="inline-block px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded">
                        {post.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 ml-4">
                    {post.owner?.fullname} |{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>

                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded mb-4"
                  />
                )}

                <p className="text-gray-700 mb-4">{post.content}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={16} />
                    {post.likeCount || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    {post.comments?.length || 0}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
