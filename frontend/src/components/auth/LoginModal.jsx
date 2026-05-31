import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export function LoginModal({ isOpen, onClose }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setLoading(true);
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      toast.success(isRegistering ? "Account created!" : "Welcome back!");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 m-4"
          >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#999] hover:bg-[#f7f7f7] hover:text-[#1a1a1a] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="flex justify-center mb-6 mt-4">
                <div className="w-12 h-12 bg-[#ff6600] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff6600]/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-2">
                  {isRegistering ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-[#666] text-sm">
                  {isRegistering 
                    ? "Sign up to start building momentum." 
                    : "Sign in to access your execution systems."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@startup.com"
                    className="w-full px-4 py-3 bg-[#f7f7f7] border border-[#e8e8e8] rounded-xl focus:bg-white focus:border-[#ff6600] focus:ring-4 focus:ring-[#ff6600]/10 transition-all outline-none text-[#1a1a1a]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#f7f7f7] border border-[#e8e8e8] rounded-xl focus:bg-white focus:border-[#ff6600] focus:ring-4 focus:ring-[#ff6600]/10 transition-all outline-none text-[#1a1a1a]"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white font-bold rounded-xl hover:bg-[#ff6600] disabled:opacity-50 disabled:hover:bg-[#1a1a1a] transition-all"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />
                  )}
                  {isRegistering ? "Create Account" : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={toggleMode}
                  className="text-sm font-semibold text-[#666] hover:text-[#ff6600] transition-colors"
                >
                  {isRegistering 
                    ? "Already have an account? Sign in" 
                    : "Need an account? Create one"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
