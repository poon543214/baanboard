import { useEffect, useRef, useState } from "react"
import { IoCallOutline, IoMailOutline } from "react-icons/io5"
import client from "../api/client"
import Configs from "../config"
import { useNavigate } from "react-router-dom"
import { textStyles } from "../style/text"
import bg from "../assets/image/bg.jpg"

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState("liked")
  const [likedPosts, setLikedPosts] = useState([])
  const [commentedPosts, setCommentedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)

      const [profileRes, likedRes, commentedRes] = await Promise.all([
        client.get(Configs.api.get.profile),
        client.get(Configs.api.get.likedpost),
        client.get(Configs.api.get.commentedpost),
      ])

      setProfile(profileRes.data)
      setLikedPosts(likedRes.data || [])
      setCommentedPosts(commentedRes.data || [])

    } catch (err) {
      console.error(err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setProfile((prev) => ({ ...prev, profileImage: previewUrl }))

    const formData = new FormData()
    formData.append("profileImage", file)

    try {
      setUploading(true)
      await client.put(Configs.api.put.updateProfile, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      fetchAll()

    } catch (err) {
      console.error(err)
      alert("Upload failed")
      fetchAll()
    } finally {
      setUploading(false)
    }
  }

  const renderPosts = (posts) => {
    if (!posts.length)
      return <p className="text-gray-500">No posts found</p>

    return posts.map((post) => (
      <PostCard key={post._id} post={post} />
    ))
  }

  if (loading) return <p className="p-10">Loading...</p>
  if (error) return <p className="p-10 text-red-500">{error}</p>

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-56">
        <div className="absolute inset-0 bg-[#47A19C]/50" />
        <div className="h-56 bg-gray-100" style={{ backgroundImage: `url(${bg})`}}/>              
      </div>

      <div className="bg-white shadow relative">
        <div className="max-w-6xl mx-auto px-8 py-6 relative">

          <div className="absolute -top-20 left-8">
            <div className="relative">
              <img
                src={
                  profile?.profileImage
                }
                alt="profile"
                className={`w-40 h-40 rounded-full border-4 border-white object-cover ${
                  uploading ? "opacity-50" : ""
                }`}
              />
            </div>

            <p
              onClick={handleFileSelect}
              className="absolute -bottom-10 left-8 text-sm text-gray-600 cursor-pointer hover:underline"
            >
              Change profile
            </p>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="ml-56 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                @{profile?.fullname}
              </h1>

              <p className="text-gray-600 mt-1">
                {profile?.fullname}
              </p>

              <div className="flex gap-8 mt-4 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <IoCallOutline size={18} />
                  {profile?.tel}
                </div>

                <div className="flex items-center gap-2">
                  <IoMailOutline size={18} />
                  {profile?.email}
                </div>
              </div>
            </div>

            <button
              className="text-primary font-medium hover:underline"
              onClick={() => navigate("/editprofile")}
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8 border-b mt-10 mx-10">
        <button
          onClick={() => setActiveTab("liked")}
          className={`pb-3 font-medium ${
            activeTab === "liked"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
        >
          Liked post
        </button>

        <button
          onClick={() => setActiveTab("commented")}
          className={`pb-3 font-medium ${
            activeTab === "commented"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
        >
          Commented post
        </button>
      </div>

      <div className="mt-8 space-y-6 mx-10">
        {activeTab === "liked" && renderPosts(likedPosts)}
        {activeTab === "commented" && renderPosts(commentedPosts)}
      </div>
    </div>
  )
}

function PostCard({ post }) {
  const navigate = useNavigate()
  const tags = post.tag ? post.tag.split(",") : []

  return (
    <div
      onClick={() => navigate(`/postdetail/${post._id}`)}
      className="bg-white rounded-lg shadow-sm border p-4 flex gap-4 cursor-pointer hover:shadow-md transition"
    >
      <img
        src={post.image}
        className="w-40 h-28 rounded-md object-cover"
        alt=""
      />

      <div className="flex-1">
        <h3 className="font-semibold text-primary">
          {post.title}
        </h3>

        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {post.content}
        </p>

        <div className="flex gap-2 mt-3 text-xs flex-wrap">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`${textStyles.subheader} px-3 py-1 bg-primary text-white rounded-full`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
