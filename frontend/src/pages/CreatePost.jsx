import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Configs from "../config"
import client from "../api/client"

const tags = ["News", "Sport", "Politic", "Entertainment", "Game", "Music"]

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState([]) 
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!title || !content || !image || selectedTags.length === 0) {
            alert("Please fill all fields")
            return
        }

        try {
            setLoading(true)

            const formData = new FormData()
            formData.append("title", title)
            formData.append("content", content)
            formData.append("image", image)

            formData.append("tag", selectedTags.join(","))

            await client.post(Configs.api.post.newPost, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            })

            alert("Post created successfully")
            navigate("/")
        } catch (err) {
            console.error("Create post error:", err)
            alert("Failed to create post")
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="min-h-[91vh] flex justify-center bg-gray-100 py-10">
      <div className="bg-white shadow rounded w-1/2 p-8">
        <h2 className="text-2xl font-semibold mb-6 text-teal-600">
          Create New Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Content</label>
            <textarea
              rows="4"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Select Tags (เลือกได้หลายอัน)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag)

                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-1 rounded-full border transition 
                      ${
                        isSelected
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-teal-100"
                      }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full h-60 object-cover rounded"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  )
}
