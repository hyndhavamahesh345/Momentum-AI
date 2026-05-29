import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, LogIn } from 'lucide-react';
import { useAuth } from '@/store/auth';

export function LoginModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    login(username.trim().toLowerCase().replace(/\s+/g, '_'));
    onClose();
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
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-2">Welcome Back</h2>
                <p className="text-[#666] text-sm">Enter a username to access your execution systems.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. hackathon_user_1"
                    className="w-full px-4 py-3 bg-[#f7f7f7] border border-[#e8e8e8] rounded-xl focus:bg-white focus:border-[#ff6600] focus:ring-4 focus:ring-[#ff6600]/10 transition-all outline-none text-[#1a1a1a]"
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white font-bold rounded-xl hover:bg-[#ff6600] disabled:opacity-50 disabled:hover:bg-[#1a1a1a] transition-all"
                >
                  <LogIn size={18} />
                  Access Dashboard
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
