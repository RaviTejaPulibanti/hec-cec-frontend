"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Exam } from "@/types";
import { Button } from "@/components/ui/Button";
import { Clock, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardExams();
  }, []);

  const fetchLeaderboardExams = async () => {
    try {
      const res = await api.get("/student/leaderboard-list");
      setExams(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard exams", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leaderboards for Completed Exams</h1>
        <p className="mt-2 text-slate-500">Select an exam below to view its leaderboard.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-slate-500">Loading completed exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-slate-500">No completed exams available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-indigo-100"
            >
              <div>
                <div className="mb-4 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  Completed
                </div>
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{exam.title}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="mr-2 h-4 w-4 text-slate-400" />
                    {exam.duration} Minutes
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <BookOpen className="mr-2 h-4 w-4 text-slate-400" />
                    {exam.totalQuestions} Questions
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href={`/dashboard/leaderboard/${exam._id}`}>
                  <Button className="w-full" variant="outline">
                    <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
