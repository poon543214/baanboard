import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import client from "../api/client"
import Configs from "../config"
import bg from "../assets/image/bg.jpg"
import { textStyles } from "../style/text"

export default function EditPost() {
  const navigate = useNavigate()
  const { id } = useParams()

  const tags = ["News", "Sport", "Politic", "Entertainment", "Game", "Music"]

  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "", 
    tag: [],       
  })

  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPost()
  }, [])

  const fetchPost = async () => {
    try {
      const res = await client.get(
        Configs.api.get.post + "/" + id
      )

      setForm({
        title: res.data.title || "",
        content: res.data.content || "",
        image: res.data.image || "",
        tag: res.data.tag ? res.data.tag.split(",") : [],
      })

    } catch (err) {
      console.error(err)
      setError("Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const formData = new FormData()

      formData.append("title", form.title)
      formData.append("content", form.content)
      formData.append("tag", form.tag.join(","))

      if (imageFile) {
        formData.append("image", imageFile)
      }

      await client.put(
        Configs.api.put.updatePost + id,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      alert("Post updated successfully")
      navigate(-1)

    } catch (err) {
      console.error(err)
      alert("Update failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-10">Loading...</p>
  if (error) return <p className="p-10 text-red-500">{error}</p>

  return (
    <div className="min-h-[90.8vh] flex items-center justify-center bg-[#f0f4f3]">
      <div className="relative bg-white rounded-[40px] shadow-xl w-[700px] max-w-full p-12 overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center scale-110 opacity-10"
          style={{ backgroundImage: `url(${bg})` }}
        />

        <div className="relative z-10 flex flex-col gap-6">

          <h1 className={`${textStyles.title} text-center text-gray-800`}>
            Edit Post
          </h1>

          <Input
            label="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">
              Content
            </label>
            <textarea
              rows={5}
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
              className="px-3 py-2 rounded-lg border bg-white/80 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  setImageFile(file)
                  setForm({
                    ...form,
                    image: URL.createObjectURL(file), 
                  })
                }
              }}
              className="px-3 py-2 rounded-lg border bg-white/80"
            />
          </div>

          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="w-full h-60 object-cover rounded-lg"
            />
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Tags
            </label>

            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const isSelected = form.tag.includes(t)

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setForm({
                          ...form,
                          tag: form.tag.filter((item) => item !== t),
                        })
                      } else {
                        setForm({
                          ...form,
                          tag: [...form.tag, t],
                        })
                      }
                    }}
                    className={`px-4 py-2 rounded-full border transition
                      ${
                        isSelected
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-white hover:bg-gray-100"
                      }
                    `}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="w-1/2 border border-gray-400 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-1/2 bg-primary text-white py-3 rounded-lg font-bold hover:bg-teal-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-800">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="px-3 py-2 rounded-lg border bg-white/80 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  )
}
