"use client";

import { useState } from "react";
import { HiBars3, HiXMark } from "react-icons/hi2";
import {
  MdPerson,
  MdLogout,
} from "react-icons/md";
import { useAuth, useLogout } from "../../hooks/useAuth";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import Logo from "../common/Logo";
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
          {/* NPS Logo */}
          <Logo />

          {/* Separator Line */}
          <div className="h-8 md:h-12 w-px bg-gray-300 mx-2 md:mx-4 shrink-0"></div>

          {/* eNGAO Logo Text */}
          <ENgaoLogo size="md" />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {user && (
          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <MdPerson className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* User Details - Hidden on small screens, shown on medium+ */}
              <div className="hidden md:flex flex-col gap-0.5">
                <h3 className="font-semibold text-sm text-gray-900 leading-tight whitespace-nowrap">
                  {user.name}
                </h3>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="bg-white p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-15 h-15 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <MdPerson className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {formatRole(user.role || "")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="p-3 border-t border-gray-200">
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
