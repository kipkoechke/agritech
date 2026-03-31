"use client";

import { useState } from "react";
import Image from "next/image";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { MdPerson, MdLogout } from "react-icons/md";
import { useAuth, useLogout } from "../../hooks/useAuth";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import ENgaoLogo from "../common/ENgaoLogo";

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

// Format role for display
const formatRole = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Header = ({ onMenuToggle, isMobileMenuOpen }: HeaderProps) => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useOutsideClick(() => setIsProfileOpen(false));

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="bg-white font-bold tracking-widest border-b border-gray-200 flex items-center justify-between px-3 md:px-8 py-2 col-span-full sticky top-0 z-30">
      
      {/* LEFT SIDE */}
      <div className="flex items-center min-w-0">
        
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 mr-2 shrink-0"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <HiXMark className="w-6 h-6" />
          ) : (
            <HiBars3 className="w-6 h-6" />
          )}
        </button>

        <div className="flex items-center min-w-0">
          
          {/* ✅ Image Logo (NEW) */}
          <Image
            src="/assets/logo.webp"
            alt="SOKOCHAPP"
            width={120}
            height={40}
            className="object-contain"
            priority
          />

          {/* Separator */}
          <div className="h-8 md:h-12 w-px bg-gray-300 mx-2 md:mx-4 shrink-0"></div>

          {/* eNGAO Logo */}
          <ENgaoLogo size="md" />
        </div>
      </div>

      {/* RIGHT SIDE (USER PROFILE) */}
      <div className="flex items-center gap-2 md:gap-3">
        {user && (
          <div className="relative" ref={profileRef}>
            
            {/* Profile Trigger */}
            <div
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <MdPerson className="w-5 h-5 text-primary" />
              </div>

              {/* Name */}
              <div className="hidden md:flex flex-col">
                <h3 className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                  {user.name}
                </h3>
              </div>
            </div>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                
                {/* User Info */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <MdPerson className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-900 truncate">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {formatRole(user.role || "")}
                    </p>
                  </div>
                </div>

                {/* Logout */}
                <div className="p-3">
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    <MdLogout className="w-4 h-4" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;