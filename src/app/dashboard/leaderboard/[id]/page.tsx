"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Trophy, ArrowLeft, Clock, Medal, Award, User } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  timeTaken: number;
  submittedAt: string;
}

export default function ExamLeaderboardPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [id]);

  const fetchLeaderboard = async () => {
    try {
      // Use existing endpoint
      const res = await api.get(`/student/exams/${id}/leaderboard`);
      setEntries(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankDisplay = (rank: number) => {
    return <span className="text-sm font-bold text-slate-700">#{rank}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/leaderboard")} className="px-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exam Leaderboard</h1>
            <p className="mt-1 text-slate-500">See how you stack up against the competition.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-slate-500">Loading leaderboard...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white text-center">
          <Trophy className="h-12 w-12 text-slate-300" />
          <p className="text-slate-500">No results have been submitted for this exam yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4">Rank</th>
                  <th scope="col" className="px-6 py-4">Student Name</th>
                  <th scope="col" className="px-6 py-4">Score</th>
                  <th scope="col" className="px-6 py-4">Time Taken</th>
                  <th scope="col" className="px-6 py-4">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.rank} className="transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center justify-center w-8">
                        {getRankDisplay(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{entry.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                        {entry.score} pts
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-500">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(entry.submittedAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
