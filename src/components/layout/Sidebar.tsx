"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  FileText,
  ListTodo,
  LogOut,
  GraduationCap,
  Users
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
        { name: "Questions", href: "/admin/questions", icon: ListTodo },
        { name: "Users", href: "/admin/users", icon: Users },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Results", href: "/dashboard/results", icon: GraduationCap },
      ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-bold text-indigo-600 text-xl tracking-tight">
          <img src="/logo.png" alt="HEC Exam Logo" className="h-8 w-auto object-contain" />
          HEC
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
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
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
            <span className="text-xs text-slate-500 capitalize truncate">{user.role.toLowerCase()}</span>
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
