import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowLeft } from 'lucide-react';
import Configs from '../config';
import bg from '../assets/image/bg.jpg'; // นำเข้าภาพพื้นหลังเหมือนหน้า ForgotPassword

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${Configs.api.baseApiUrl}${Configs.api.auth.resetPassword}/${id}/${token}`, { newPassword });
      setMessage(res.data.message);
      
      // หน่วงเวลา 3 วินาทีแล้วพากลับไปหน้า Login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'ลิงก์อาจหมดอายุแล้ว กรุณาทำรายการใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-md w-full space-y-8 bg-white p-8 rounded-[28px] shadow-xl overflow-hidden">
        {/* ใส่ Background จางๆ เหมือนหน้า ForgotPassword */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 opacity-10"
          style={{ backgroundImage: `url(${bg})` }}
        />
        
        <div className="relative z-10">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-secondary">
              ตั้งรหัสผ่านใหม่
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชี BaanBoard ของคุณ
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary/40 focus:border-primary sm:text-sm"
                  placeholder="รหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength="6"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary/40 focus:border-primary sm:text-sm"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength="6"
                />
              </div>
            </div>

            {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg text-center">{message}</div>}
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading || message}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:bg-primary/60 transition-colors"
              >
                {isLoading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
              </button>
            </div>
          </form>

          {/* เพิ่มปุ่มกลับหน้า Login เพื่อความสะดวก */}
          <div className="text-center mt-4">
            <Link to="/login" className="inline-flex items-center text-sm text-primary hover:text-teal-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;