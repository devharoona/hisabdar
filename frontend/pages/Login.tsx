import React, { useState } from 'react';
import { IndianRupee, User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (businessName: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      onLogin(data.businessName);
    } catch (err) {
      setError('Server connection failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 p-8 rounded-2xl shadow-2xl border border-stone-800 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 to-orange-600"></div>

        <div className="flex justify-center mb-8">
          <div className="bg-amber-600/20 p-4 rounded-full text-amber-500 ring-1 ring-amber-500/30">
            <IndianRupee size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-stone-100 mb-3">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-center text-stone-400 mb-8 leading-relaxed">
          {isRegister ? 'Start managing your business' : 'Sign in to continue'}
        </p>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Business Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-stone-500" />
              </div>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
                className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-stone-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/20"
          >
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;