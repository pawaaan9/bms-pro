import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // First, authenticate with Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Then, send the ID token to our backend to get custom JWT
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      // Save token/role using auth context
      await login(data.token, data.role);
      navigate('/Welcome', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle Firebase Auth errors with creative messages
      if (err.code === 'auth/user-not-found') {
        setError('🔍 Oops! We couldn\'t find an account with that email. Double-check your email or contact support.');
      } else if (err.code === 'auth/wrong-password') {
        setError('🔐 That password doesn\'t look right. Try again or reset your password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('📧 That email address looks a bit off. Please check the format and try again.');
      } else if (err.code === 'auth/user-disabled') {
        setError('🚫 This account has been temporarily disabled. Please contact your administrator.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('⏰ Whoa there! Too many attempts. Take a breather and try again in a few minutes.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('🤔 Hmm, those credentials don\'t match our records. Check your email and password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('🌐 Connection issues! Check your internet and try again.');
      } else if (err.code === 'auth/weak-password') {
        setError('💪 Password too weak! Make it stronger with more characters.');
      } else {
        setError('😅 Something went wrong! Please try again or contact support if the issue persists.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">BMSPRO</h2>
        <h2 className="text-xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded px-3 py-2 pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold mb-2"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
