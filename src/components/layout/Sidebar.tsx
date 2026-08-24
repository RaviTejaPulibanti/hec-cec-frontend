"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  GraduationCap,
  Users,
  User,
  RefreshCw,
  Trophy,
  Megaphone,
  BarChart3
} from "lucide-react";
import { UserRole } from "@/types";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const isAdmin = user.role === UserRole.COLLEGE_ADMIN;

  const links = isAdmin
    ? [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Exams", href: "/admin/exams", icon: FileText },
        { name: "Exams Analysis", href: "/admin/analysis", icon: BarChart3 },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Exam Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
        { name: "My Results", href: "/dashboard/results", icon: GraduationCap },
        { name: "Profile", href: "/dashboard/profile", icon: User },
      ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-[#dce5e7] bg-white">
      <div className="flex h-16 items-center border-b border-[#dce5e7] px-6">
        <div className="flex items-center gap-2 font-bold text-[#176d6a] text-xl tracking-tight">
          <img src="/logo.png" alt="HEC Exam Logo" className="h-8 w-auto object-contain" />
          HEC
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onNavigate}
                className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#e2f2ef] text-[#176d6a] shadow-sm"
                    : "text-[#557078] hover:bg-[#eef5f5] hover:text-[#172f36]"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-[#176d6a]" : "text-[#8aa0a5] group-hover:text-[#36545b]"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#dce5e7] p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4f0eb] text-[#176d6a] font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-[#172f36] truncate">{user.name}</span>
            <span className="text-xs text-[#71858a] capitalize truncate">{user.role.toLowerCase()}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
