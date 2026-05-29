import React from "react";
import { Zap, LogOut } from "lucide-react";
import { useAuth } from "@/store/auth";
import { LoginModal } from "../auth/LoginModal";

export function LandingNav() {
  const { userId, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();

  const handleActionClick = () => {
    if (userId) {
      window.location.href = "/dashboard";
    } else {
      openLoginModal();
    }
  };

  return (
    <>
      <nav className="border-b border-[#e8e8e8] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#ff6600] rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-[#1a1a1a]">
              Momentum AI
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#how"
              className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
            >
              Features
            </a>
            
            {userId ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleActionClick}
                  className="text-sm font-semibold text-[#ff6600] hover:underline transition-all"
                >
                  Dashboard →
                </button>
                <button
                  onClick={logout}
                  className="text-[#999] hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleActionClick}
                className="text-sm font-semibold text-[#ff6600] hover:underline transition-all"
              >
                Log In →
              </button>
            )}
          </div>
        </div>
      </nav>
      
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
