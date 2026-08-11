"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Award, Target, TrendingUp } from "lucide-react";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Endpoint depends on backend implementation
      const response = await api.get("/student/results");
      setResults(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch results", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Results</h1>
        <p className="mt-2 text-slate-500">Track your performance and past exam scores.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Mocked overall stats for visual appeal */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Exams Taken</p>
            <p className="text-2xl font-bold text-slate-900">{results.length || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">--%</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Highest Score</p>
            <p className="text-2xl font-bold text-slate-900">--</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Exam Title</th>
                <th className="px-6 py-4 font-semibold">Date Taken</th>
                <th className="px-6 py-4 font-semibold text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Loading results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No results found. Take an exam to see your scores here.
                  </td>
                </tr>
              ) : (
                results.map((result, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{result.exam?.title || `Exam #${idx+1}`}</td>
                    <td className="px-6 py-4">{new Date(result.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        {result.score} / {result.totalMarks}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
