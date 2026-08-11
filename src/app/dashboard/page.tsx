"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Exam } from "@/types";
import { Button } from "@/components/ui/Button";
import { Clock, BookOpen, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [completedExamIds, setCompletedExamIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get("/student/exams"),
        api.get("/student/results")
      ]);
      
      setExams(examsRes.data.data || []);
      
      const completedIds = new Set<string>();
      (resultsRes.data.data || []).forEach((result: any) => {
        if (result.exam?._id) completedIds.add(result.exam._id);
      });
      setCompletedExamIds(completedIds);
    } catch (error) {
      console.error("Failed to fetch exams", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Available Exams</h1>
        <p className="mt-2 text-slate-500">Select an exam below to begin.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-slate-500">Loading exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-slate-500">No active exams available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 transition-all ${
                completedExamIds.has(exam._id)
                  ? "ring-emerald-100 opacity-90"
                  : "ring-slate-100 hover:shadow-md hover:ring-indigo-100"
              }`}
            >
              <div>
                {/* Fallback to 'General' if subject isn't populated */}
                <div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                  General
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
                {completedExamIds.has(exam._id) ? (
                  <Button className="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200" disabled>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Completed
                  </Button>
                ) : (
                  <Link href={`/exam/${exam._id}`}>
                    <Button className="w-full">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Exam
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
