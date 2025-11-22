import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';

interface LoginProps {
  onLogin: (businessName: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate remote authentication delay
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would come from Google's OAuth provider
      onLogin('User via Google');
    }, 1500);
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
        
        <h1 className="text-3xl font-bold text-center text-stone-100 mb-3">Welcome to Hisabdar</h1>
        <p className="text-center text-stone-400 mb-10 leading-relaxed">
          The smart, automated accounting solution for your local business.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-stone-100 text-stone-800 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10 group relative overflow-hidden"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>
        
        <p className="text-center text-xs text-stone-500 mt-8">
          By signing in, you agree to our Terms of Service.
          <br/>This is a secure local session.
        </p>
      </div>
    </div>
  );
};

export default Login;