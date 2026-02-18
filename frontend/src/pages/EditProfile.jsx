import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import client from "../api/client"
import Configs from "../config"
import bg from "../assets/image/bg.jpg"
import { textStyles } from "../style/text"

export default function EditProfile() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullname: "",
    tel: "",
    email: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await client.get(Configs.api.get.profile)

      setForm({
        fullname: res.data.fullname || "",
        tel: res.data.tel || "",
        email: res.data.email || "",
      })
    } catch (err) {
      console.error(err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      await client.put(Configs.api.put.updateProfile, form)

      alert("Profile updated successfully")
      navigate("/profile")
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
      <div className="relative bg-white rounded-[40px] shadow-xl w-[600px] max-w-full p-12 overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center scale-110 opacity-10"
          style={{ backgroundImage: `url(${bg})` }}
        />

        <div className="relative z-10 flex flex-col gap-6">

          <h1 className={`${textStyles.title} text-center text-gray-800`}>
            Edit Profile
          </h1>

          <Input
            label="Fullname"
            value={form.fullname}
            onChange={(e) =>
              setForm({ ...form, fullname: e.target.value })
            }
          />

          <Input
            label="Telephone"
            value={form.tel}
            onChange={(e) =>
              setForm({ ...form, tel: e.target.value })
            }
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => navigate("/profile")}
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
