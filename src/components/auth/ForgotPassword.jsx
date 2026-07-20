import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email harus diisi');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lupa Password
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Masukkan email Anda untuk mereset password
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-4 rounded-lg mb-4">
                <p>Email reset password telah dikirim ke {email}</p>
                <p className="text-sm mt-2">Silakan cek kotak masuk email Anda</p>
              </div>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              >
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                         py-3 px-4 rounded-lg transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengirim...' : 'Kirim Email Reset'}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                >
                  Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
