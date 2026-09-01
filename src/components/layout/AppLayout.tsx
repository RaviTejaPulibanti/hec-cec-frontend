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
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

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
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/45 transition-opacity duration-200 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/20 bg-gradient-to-r from-[#a14e40] to-[#8a3f33] px-4 text-white shadow-sm md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" priority />
              <span className="truncate text-base font-bold tracking-tight">HEC Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
              title="Refresh Page"
              aria-label="Refresh page"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="hidden h-16 flex-shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#a14e40] to-[#8a3f33] px-6 text-white md:flex">
          <div className="flex items-center gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-inner">
              <Image src="/logo.png" alt="HEC logo" width={30} height={30} className="object-contain" priority />
            </div>
            {mounted && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white/95">
                  Welcome back, {useAuthStore.getState().user?.name?.split(" ")[0] || "User"}
                </span>
                <span className="text-[11px] font-medium text-white/70">{currentDate}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-white/15 transition-all duration-200 hover:bg-white/15 hover:shadow-md"
            title="Refresh Page"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <main className="flex-1 overflow-y-auto bg-[#f3f6f7]">
          <div className="mx-auto min-h-full max-w-7xl px-3 py-4 sm:px-4 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
