"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Menu, LogOut, RefreshCw } from "lucide-react";
import Image from "next/image";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    
    // Basic protection (token logic handles validation usually)
    const token = localStorage.getItem("token");
    if (!isAuthenticated && !token) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f6f7] text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/45 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/20 bg-[#a14e40] px-4 text-white md:hidden">
          <div className="flex items-center min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-3 flex min-w-0 items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" priority />
              <span className="truncate text-lg font-bold tracking-tight text-white">HEC Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
              title="Refresh Page"
              aria-label="Refresh page"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden h-16 flex-shrink-0 items-center justify-between border-b border-white/20 bg-[#a14e40] px-8 text-white md:flex">
          <div className="flex items-center">
            {mounted && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  Welcome back, {useAuthStore.getState().user?.name?.split(' ')[0] || "User"}
                </span>
                <span className="text-xs font-medium text-white/70">{currentDate}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-white/20 hover:shadow-md"
            title="Refresh Page"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <main className="flex-1 overflow-y-auto bg-[#f3f6f7]">
          <div className="mx-auto min-h-full max-w-7xl bg-[#f3f6f7] px-3 py-4 sm:px-4 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
