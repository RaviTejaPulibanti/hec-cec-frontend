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
    <div className="flex h-screen overflow-hidden bg-[#f3f6f7]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#10252b]/60 md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Mobile header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#dce5e7] bg-[#f8fbfb] px-4 md:hidden">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#557078] hover:bg-[#e7f1f1] focus:outline-none focus:ring-2 focus:ring-[#1b8c86]"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-3 flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" priority />
              <span className="font-bold text-[#176d6a] text-lg tracking-tight">HEC Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => window.location.reload()}
              className="rounded-lg p-2 text-[#557078] hover:bg-[#e7f1f1] focus:outline-none focus:ring-2 focus:ring-[#1b8c86] transition-colors"
              title="Refresh Page"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden h-16 flex-shrink-0 items-center justify-between border-b border-[#dce5e7] bg-[#f8fbfb] px-8 md:flex">
          <div className="flex items-center">
            {mounted && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#172f36]">
                  Welcome back, {useAuthStore.getState().user?.name?.split(' ')[0] || "User"}
                </span>
                <span className="text-xs font-medium text-[#71858a]">
                  {currentDate}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg bg-[#f8fbfb] px-3 py-2 text-sm font-medium text-[#36545b] shadow-sm ring-1 ring-[#dce5e7] hover:bg-white transition-all hover:shadow-md"
            title="Refresh Page"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
