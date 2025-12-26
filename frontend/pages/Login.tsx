import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';

interface LoginProps {
  onLogin: (businessName: string, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister 
        ? formData 
        : { email: formData.email, password: formData.password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data.businessName, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 p-8 rounded-2xl shadow-2xl border border-stone-800 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 to-orange-600"></div>

        <div className="flex justify-center mb-8">
          <div className="bg-amber-600/20 p-4 rounded-full text-amber-500 ring-1 ring-amber-500/30">
            <IndianRupee size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-stone-100 mb-3">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-center text-stone-400 mb-8">
          {isRegister ? 'Start managing your business' : 'Sign in to your account'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Business Name</label>
              <input
                type="text"
                required
                className="w-full p-3 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full p-3 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-amber-500 hover:text-amber-400 text-sm"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
        
        <p className="text-center text-xs text-stone-500 mt-8">
          Your data is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default Login;
