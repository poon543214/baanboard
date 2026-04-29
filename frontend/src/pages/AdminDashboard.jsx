import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAdminDashboardApi } from "../api/admin"

function KpiCard({ title, value, hint, tone = "slate" }) {
  const toneMap = {
    slate: "from-secondary to-slate-700",
    blue: "from-primary to-teal-700",
    emerald: "from-teal-600 to-primary",
    violet: "from-primary to-cyan-700"
  }

  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${toneMap[tone]}`}>
      <p className="text-sm text-white/80">{title}</p>
      <p className="text-3xl font-bold mt-2 tracking-tight">{value}</p>
      <p className="text-xs text-white/80 mt-1">{hint}</p>
    </div>
  )
}

function MetricRow({ label, value, percent }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-teal-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getAdminDashboardApi()
      setStats(data)
      setError("")
    } catch (err) {
      setError(err?.response?.data?.message || "Cannot load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="min-h-[91vh] bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-secondary to-primary text-white px-6 py-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Operations Center</p>
              <h1 className="text-3xl font-semibold mt-1">Admin Dashboard</h1>
              <p className="text-sm text-white/80 mt-1">Live overview for community growth and support health</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/chat")}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium border border-white/25"
              >
                Open inbox
              </button>
              <button
                onClick={loadStats}
                className="px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition text-sm font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-6 text-sm text-gray-500 shadow-sm border border-slate-200">Loading dashboard...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm">{error}</div>
        ) : (
          <div className="space-y-5">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard title="Total Accounts" value={stats?.users?.total ?? 0} hint="registered members" tone="blue" />
              <KpiCard title="Total Posts" value={stats?.posts?.total ?? 0} hint="all published content" tone="violet" />
              <KpiCard title="Open Conversations" value={stats?.chats?.openConversations ?? 0} hint="waiting for admin reply" tone="emerald" />
              <KpiCard title="Conversations" value={stats?.chats?.totalConversations ?? 0} hint="active user conversations" tone="slate" />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Platform Activity</h2>
                <p className="text-sm text-slate-500 mt-1">Core engagement metrics and publishing velocity</p>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Content</p>
                    <p className="text-2xl font-semibold text-slate-800 mt-2">{stats?.posts?.last7Days ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-1">new posts in last 7 days</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Engagement per post</p>
                    <p className="text-2xl font-semibold text-slate-800 mt-2">{stats?.posts?.avgEngagementPerPost ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-1">avg likes + comments per post</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total likes</p>
                    <p className="text-2xl font-semibold text-slate-800 mt-2">{stats?.posts?.likes ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-1">across all posts</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total comments</p>
                    <p className="text-2xl font-semibold text-slate-800 mt-2">{stats?.posts?.comments ?? 0}</p>
                    <p className="text-xs text-slate-500 mt-1">across all posts</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Operational Health</h2>
                <p className="text-sm text-slate-500 mt-1">Role mix and support pressure indicators</p>
                <div className="mt-5 space-y-4">
                  <MetricRow
                    label="Admin ratio"
                    value={`${stats?.users?.adminRatio ?? 0}%`}
                    percent={stats?.users?.adminRatio ?? 0}
                  />
                  <MetricRow
                    label="Pending support ratio"
                    value={`${stats?.chats?.pendingSupportRatio ?? 0}%`}
                    percent={stats?.chats?.pendingSupportRatio ?? 0}
                  />
                  <MetricRow
                    label="Member coverage"
                    value={`${stats?.users?.members ?? 0} users`}
                    percent={stats?.users?.memberRatio ?? 0}
                  />
                </div>
                <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600">
                  Open: {stats?.chats?.openConversations ?? 0} | Closed: {stats?.chats?.closedConversations ?? 0} conversations
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
