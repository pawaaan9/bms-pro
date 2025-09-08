import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('super_admin');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hallName, setHallName] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    postcode: '',
    state: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        // Registration API
        let body = { email, password, role };
        if (role === 'hall_owner') {
          body = {
            ...body,
            hallName,
            address,
          };
        }
        const res = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setEmail('');
        setPassword('');
  setHallName('');
  setAddress({ line1: '', line2: '', postcode: '', state: '' });
      } else {
        // Login API
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        // Save token/role as needed
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        navigate('/Welcome', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">BMSPRO</h2>
        <h2 className="text-xl font-bold mb-6 text-center">{isRegister ? 'Register' : 'Admin Login'}</h2>
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
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {isRegister && (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Role</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={role}
                onChange={e => setRole(e.target.value)}
                required
              >
                <option value="super_admin">Super Admin</option>
                <option value="hall_owner">Hall Owner</option>
              </select>
            </div>
            {role === 'hall_owner' && (
              <>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Hall Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={hallName}
                    onChange={e => setHallName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2 font-semibold">Address</div>
                <div className="mb-2">
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Line 1"
                    value={address.line1}
                    onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                    required
                  />
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Line 2"
                    value={address.line2}
                    onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Postcode"
                    value={address.postcode}
                    onChange={e => setAddress(a => ({ ...a, postcode: e.target.value }))}
                    required
                  />
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="State"
                    value={address.state}
                    onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}
          </>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold mb-2"
          disabled={loading}
        >
          {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
        </button>
        <div className="text-center mt-2">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
            onClick={() => { setIsRegister(r => !r); setError(''); }}
          >
            {isRegister ? 'Already have an account? Login' : 'New user? Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
