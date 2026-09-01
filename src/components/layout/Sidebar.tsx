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
  Trophy,
  Megaphone,
  BarChart3,
  ClipboardList,
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
    <div className="flex h-screen w-[82vw] max-w-[280px] flex-col border-r border-slate-200/80 bg-white/90 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:w-72">
      <div className="flex h-16 items-center justify-between bg-gradient-to-r from-[#a14e40] to-[#8a3f33] px-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-inner">
            <img src="/logo.png" alt="HEC Exam Logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">HEC</span>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/75">Portal</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white py-4">
        <div className="mb-3 px-3">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Navigation
          </p>
        </div>

        <nav className="space-y-1.5 px-3">
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
                className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#a14e40] text-white shadow-[0_10px_25px_rgba(161,78,64,0.2)]"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`mr-3 h-4 w-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/90 p-3.5">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#a14e40] to-[#8a3f33] text-sm font-bold text-white shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-[10px] uppercase tracking-[0.14em] text-slate-500">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.04)] ring-1 ring-slate-200 transition-all duration-200 hover:bg-[#fff7f5] hover:text-[#8a3f33] hover:ring-[#f0d8d2]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
