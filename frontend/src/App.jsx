import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Post from "./pages/Post"
import PostDetail from "./pages/PostDetail"
import Contact from "./pages/Contact"
import Profile from "./pages/Profile"
import EditProfile from "./pages/EditProfile"
import EditPost from "./pages/EditPost"
import Search from "./pages/Search"
import CreatPost from "./pages/CreatePost"
import AdminChat from "./pages/AdminChat"
import AdminDashboard from "./pages/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import MainLayout from "./layout/MainLayout"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post" element={<Post />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/editpost/:id" element={<EditPost />} />
            <Route path="/postdetail/:id" element={<PostDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/createpost" element={<CreatPost />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/chat" element={<AdminChat />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
