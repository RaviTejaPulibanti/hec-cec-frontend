"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Users, FileText, CheckCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({
    totalExams: 0,
    totalStudents: 0,
    totalResults: 0
  });
  
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get("/admin/stats");
        if (statsRes.data.success) {
          setStatsData(statsRes.data.data);
        }
        
        const resultsRes = await api.get("/admin/results");
        if (resultsRes.data.success) {
          setRecentResults(resultsRes.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { name: "Total Exams", value: statsData.totalExams, icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Active Students", value: statsData.totalStudents, icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
    { name: "Completed Exams", value: statsData.totalResults, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-500">Overview of your exam platform.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        {recentResults.length > 0 ? (
          <div className="mt-6 flex flex-col gap-4">
            {recentResults.map((result: any) => (
              <div key={result._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">{result.student?.name || "Unknown Student"}</p>
                  <p className="text-sm text-slate-500">Completed {result.exam?.title || "Unknown Exam"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">Score: {result.score}</p>
                  <p className="text-xs text-slate-400">{new Date(result.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">No recent activity found</p>
          </div>
        )}
      </div>
    </div>
  );
}
