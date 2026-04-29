import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/image/bg.jpg";
import { textStyles, COLORS } from "../style/text";
import { loginApi, registerApi } from "../api/auth";
import Configs from "../config";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  
  // 📌 State สำหรับฟอร์ม Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // เพิ่ม State Remember Me

  // 📌 State สำหรับฟอร์ม Register
  const [registerData, setRegisterData] = useState({
    fullname: "",
    email: "",
    tel: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false); // เพิ่ม State เปิด/ปิด Modal Terms

  const handleLogin = async () => {
    try {
      // 📌 อย่าลืมส่ง rememberMe ไปที่ loginApi ด้วยนะครับ (ต้องไปอัปเดตไฟล์ api/auth.js ให้รับพารามิเตอร์นี้ด้วย)
      const data = await loginApi(email, password, rememberMe);
      
      localStorage.setItem(Configs.storage.token, data.token);
      login({
        id: data.id,
        username: data.fullname,
        fullname: data.fullname,
        tel: data.tel,
        email: data.email,
        role: data.role,
        profileImage: data.profileImage,
      });
      console.log("login success : ", data);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed");
    }
  };

  const validateRegister = () => {
    const newErrors = {};
    const { fullname, email, tel, password, confirmPassword } = registerData;

    if (!fullname.trim()) newErrors.fullname = "Full name is required";
    
    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = "Invalid email format";
    }

    if (!tel) {
      newErrors.tel = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(tel)) newErrors.tel = "Phone must be 10 digits";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!registerData.agree) {
      newErrors.agree = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;

    try {
      const { fullname, email, tel, password } = registerData;
      const data = await registerApi(fullname, email, tel, password);

      console.log("Register success:", data);
      alert("Register success! Please login.");

      setRegisterData({
        fullname: "",
        email: "",
        tel: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });

      setIsRegister(false);
    } catch (error) {
      console.error("Register failed:", error);
      alert("Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f3] relative">
      <div className="relative bg-white rounded-[40px] shadow-xl w-[1015px] max-w-full min-h-[715px] overflow-hidden">
        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-[#47A19C]/40 backdrop-blur-[10px]" />

        {/* ----------------- Sliding Panel (Forms) ----------------- */}
        <div
          className={`bg-white absolute top-0 left-0 h-full w-1/2 p-12 transition-all duration-1000 z-20
          ${isRegister ? "translate-x-full" : "translate-x-0"}
        `}
        >
          {/* ----- Login Form ----- */}
          <div
            className={`h-full flex flex-col justify-center gap-2 p-12 transition-opacity duration-[150ms] delay-[200ms] absolute inset-0
            ${isRegister ? "opacity-0 pointer-events-none" : "opacity-100"}
          `}
          >
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="flex justify-between text-xs text-gray-700 mt-3">
              <label className="flex items-center cursor-pointer">
                {/* 📌 ผูก State rememberMe */}
                <input 
                  type="checkbox" 
                  className="mr-1 cursor-pointer" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> remember me
              </label>
              <Link to="/forgot-password" className="text-gray-700 hover:text-teal-600 hover:underline">
                Forgot password
              </Link>
            </div>

            <button
              onClick={handleLogin}
              className={`mt-5 bg-primary hover:bg-teal-600 text-white py-3 rounded-lg font-bold transition-colors`}
            >
              Login
            </button>
          </div>

          {/* ----- Register Form ----- */}
          <div
            className={`h-full flex flex-col justify-center gap-2 px-12 py-8 transition-opacity duration-[150ms] delay-[200ms] absolute inset-0
            ${isRegister ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
          >
            <Input label="Full name" value={registerData.fullname} onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })} error={errors.fullname} />
            <Input label="Email" type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} error={errors.email} />
            <Input label="Telephone number" value={registerData.tel} onChange={(e) => setRegisterData({ ...registerData, tel: e.target.value })} error={errors.tel} />
            <Input label="Password" type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} error={errors.password} />
            <Input label="Confirm password" type="password" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} error={errors.confirmPassword} />

            <div className="mt-3">
              <label className="text-xs text-gray-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={registerData.agree}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, agree: e.target.checked });
                    if (errors.agree) setErrors({...errors, agree: null});
                  }}
                  className="cursor-pointer"
                />
                <span>
                  I agree to{' '}
                  {/* 📌 ปุ่มเปิด Modal */}
                  <button 
                    type="button" 
                    onClick={() => setShowTerms(true)}
                    className="text-teal-600 hover:text-teal-800 hover:underline font-bold"
                  >
                    Terms and Agreement
                  </button>
                </span>
              </label>
              {errors.agree && <p className="text-red-500 text-[10px] mt-1">{errors.agree}</p>}
            </div>

            <button
              onClick={handleRegister}
              disabled={!registerData.agree}
              className={`mt-4 text-white py-3 rounded-lg font-bold transition-colors
                ${!registerData.agree ? "bg-gray-400 opacity-50 cursor-not-allowed" : "bg-[#47A19C] hover:bg-teal-700"}
              `}
            >
              Create account
            </button>
          </div>
        </div>

        {/* ----------------- Static Info Panels ----------------- */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div
            className={`absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center items-center text-center px-12 text-white transition-all duration-0 ease-in-out pointer-events-auto
              ${isRegister ? "opacity-0 scale-95 blur-sm pointer-events-none delay-[700ms]" : "opacity-100 scale-100 blur-0 delay-0"}
          `}
          >
            <h1 className={`${textStyles.title} mb-2`}>Welcome back</h1>
            <p className={`${textStyles.subtitle} mb-20`}>To continue, please enter<br />your login details.</p>
            <p className={`${textStyles.subheader} mb-3`}>New here? Create an account.</p>
            <button
              onClick={() => setIsRegister(true)}
              className="w-[80%] bg-white font-thai font-semibold text-[#474747] px-6 py-3 rounded-lg hover:bg-[#474747] hover:text-white duration-200"
            >
              Register
            </button>
          </div>

          <div
            className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center items-center text-center px-12 text-white transition-all duration-0 ease-in-out pointer-events-auto
              ${isRegister ? "opacity-100 scale-100 blur-0 delay-0" : "opacity-0 scale-95 blur-sm pointer-events-none delay-[700ms]"}
          `}
          >
            <h1 className={`${textStyles.title} mb-2`}>Create account</h1>
            <p className={`${textStyles.subtitle} mb-20`}>Enter your information to sign in.</p>
            <p className={`${textStyles.subheader} mb-3`}>Already have account?</p>
            <button
              onClick={() => setIsRegister(false)}
              className="w-[80%] bg-white font-thai font-semibold text-[#474747] px-6 py-3 rounded-lg hover:bg-[#474747] hover:text-white duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- Modal: Terms and Agreement ----------------- */}
      {showTerms && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTerms(false)}
          ></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#47A19C] text-white">
              <h3 className="text-lg font-bold">Terms and Agreement</h3>
              <button onClick={() => setShowTerms(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto flex-1 text-sm text-gray-700 space-y-4">
              <p>ยินดีต้อนรับสู่โปรเจกต์ BaanBoard กรุณาอ่านเงื่อนไขก่อนเข้าใช้งาน:</p>
              <h4 className="font-semibold text-gray-900 mt-2">1. การใช้งานทั่วไป</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>ห้ามโพสต์เนื้อหาที่ผิดกฎหมาย หรือก่อให้เกิดความขัดแย้ง</li>
                <li>กรุณาใช้คำสุภาพในการตั้งกระทู้และคอมเมนต์</li>
              </ul>
              <h4 className="font-semibold text-gray-900 mt-2">2. ความเป็นส่วนตัว</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>ข้อมูลส่วนตัวของคุณจะถูกเก็บรักษาไว้อย่างปลอดภัย</li>
              </ul>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowTerms(false);
                  setRegisterData({ ...registerData, agree: true });
                  if (errors.agree) setErrors({...errors, agree: null});
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#47A19C] rounded-lg hover:bg-teal-700"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 📌 คอมโพเนนต์ Input เอาไว้ล่างสุดเหมือนเดิม
function Input({ label, type = "text", value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`px-3 py-2 rounded-lg border bg-white/80 
          focus:outline-none focus:ring-2 
          ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"}`}
      />
      {error && <span className="text-red-500 text-[10px]">{error}</span>}
    </div>
  );
}