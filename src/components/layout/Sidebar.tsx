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
  BarChart3,
  ClipboardList
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
        { name: "Results", href: "/admin/results", icon: ClipboardList },
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
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-800 shadow-sm">
      <div className="flex h-16 items-center border-b border-white/15 bg-[#a14e40] px-6 text-white">
        <div className="flex items-center gap-2 font-bold text-white text-xl tracking-tight">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/5">
            <img src="/logo.png" alt="HEC Exam Logo" className="h-full w-full object-cover" />
          </div>
          HEC
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white py-5">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (pathname.startsWith(`${link.href}/`) &&
                !links.some(
                  (otherLink) =>
                    otherLink.href !== link.href &&
                    otherLink.href.length > link.href.length &&
                    pathname.startsWith(`${otherLink.href}/`)
                ));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onNavigate}
                className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#a14e40] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a14e40] text-white font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-800 truncate">{user.name}</span>
            <span className="text-xs text-slate-500 capitalize truncate">{user.role.toLowerCase()}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
