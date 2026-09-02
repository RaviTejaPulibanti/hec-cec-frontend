"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Users, TrendingUp, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export default function ExamsAnalysisPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Analysis State
  const [results, setResults] = useState<any[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchAnalysisData();
      setLeaderboardPage(1);
      setLeaderboardSearch("");
    } else {
      setResults([]);
      setLeaderboard([]);
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (selectedExamId) {
      const delay = setTimeout(() => {
        fetchLeaderboard();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [selectedExamId, leaderboardPage, leaderboardSearch]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exam");
      setExams(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedExamId(res.data.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch exams", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisData = async () => {
    try {
      setLoadingAnalysis(true);
      const res = await api.get(`/admin/results/${selectedExamId}`);
      setResults(res.data.data);
    } catch (error) {
      console.error("Failed to fetch results for analysis", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const response = await api.get(`/student/exams/${selectedExamId}/leaderboard`, {
        params: {
          page: leaderboardPage,
          limit: 10,
          search: leaderboardSearch
        }
      });
      setLeaderboard(response.data.data);
      setLeaderboardTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Compute KPIs
  const totalParticipants = results.length;
  const highestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const lowestScore = results.length > 0 ? Math.min(...results.map(r => r.score)) : 0;
  const averageScore = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1)
    : 0;

  // Compute Chart Data (Score Distribution)
  // E.g., 0-20%, 21-40%, etc. Assuming we just do raw score buckets if we don't know total questions.
  // Actually, we can just group by absolute score.
  const scoreDistributionMap: Record<number, number> = {};
  results.forEach(r => {
    scoreDistributionMap[r.score] = (scoreDistributionMap[r.score] || 0) + 1;
  });

  const chartData = Object.keys(scoreDistributionMap)
    .sort((a, b) => Number(a) - Number(b))
    .map(score => ({
      score: `Score ${score}`,
      students: scoreDistributionMap[Number(score)]
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exams Analysis</h1>
          <p className="mt-2 text-slate-500">Analyze performance, view score distributions, and check leaderboards.</p>
        </div>
        
        {!loading && exams.length > 0 && (
          <div className="w-full sm:w-72">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Exam</label>
            <Select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
            >
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>{exam.title}</option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium">Loading exams...</div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg">No exams available for analysis yet.</p>
        </div>
      ) : !selectedExamId ? null : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Participants</p>
                <p className="text-2xl font-bold text-slate-900">{totalParticipants}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Average Score</p>
                <p className="text-2xl font-bold text-slate-900">{averageScore}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Highest Score</p>
                <p className="text-2xl font-bold text-slate-900">{highestScore}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trophy className="h-6 w-6 opacity-50" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Lowest Score</p>
                <p className="text-2xl font-bold text-slate-900">{lowestScore}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart */}
            <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Score Distribution</h3>
              <div className="flex-1 w-full min-h-[300px]">
                {loadingAnalysis ? (
                  <div className="flex h-full items-center justify-center text-slate-400">Loading chart...</div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="score" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#F1F5F9'}} 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                      />
                      <Bar dataKey="students" name="Students" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No data available to plot.</div>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 flex flex-col overflow-hidden max-h-[500px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Leaderboard</h3>
              </div>
              <div className="px-4 py-3 border-b border-slate-100 bg-white">
                <input
                  type="text"
                  placeholder="Search student..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={leaderboardSearch}
                  onChange={(e) => {
                    setLeaderboardSearch(e.target.value);
                    setLeaderboardPage(1);
                  }}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                {loadingLeaderboard ? (
                  <div className="flex justify-center items-center h-40 text-slate-500">Loading...</div>
                ) : leaderboard.length > 0 ? (
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-white sticky top-0 border-b border-slate-100 shadow-sm z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-900">Rank</th>
                        <th className="px-4 py-3 font-semibold text-slate-900">Name</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leaderboard.map((item, idx) => (
                        <tr key={idx} className="transition-colors hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                            {item.rank === 1 ? "🥇 1" : item.rank === 2 ? "🥈 2" : item.rank === 3 ? "🥉 3" : item.rank}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[120px]" title={item.name}>{item.name}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                              {item.score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-slate-500">No students found.</div>
                )}
              </div>
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  disabled={leaderboardPage <= 1}
                  onClick={() => setLeaderboardPage(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1"/> Prev
                </Button>
                <span className="text-xs text-slate-500 font-medium">{leaderboardPage} / {leaderboardTotalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  disabled={leaderboardPage >= leaderboardTotalPages}
                  onClick={() => setLeaderboardPage(prev => prev + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1"/>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
