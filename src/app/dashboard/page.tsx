"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Exam } from "@/types";
import { Button } from "@/components/ui/Button";
import { Clock, BookOpen, PlayCircle, Trophy, Megaphone, CalendarClock, TrendingUp, Medal } from "lucide-react";
import Link from "next/link";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function StudentDashboardPage() {
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [completedExamIds, setCompletedExamIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalExams: 0,
    highestScoreDisplay: "0",
    highestPercentage: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [examsRes, resultsRes, announcementsRes] = await Promise.all([
        api.get("/student/exams"),
        api.get("/student/results"),
        api.get("/student/announcements")
      ]);
      
      const examsData = examsRes.data.data || { active: [], upcoming: [] };
      if (Array.isArray(examsData)) {
        setActiveExams(examsData);
        setUpcomingExams([]);
      } else {
        setActiveExams(examsData.active || []);
        setUpcomingExams(examsData.upcoming || []);
      }

      setAnnouncements(announcementsRes.data.data || []);
      
      const results = resultsRes.data.data || [];
      const completedIds = new Set<string>();
      
      let totalExams = results.filter((result: any) => result.resultsReleased !== false && result.score !== null).length;
      let highestPercentage = -Infinity;
      let highestScoreDisplay = "0";

      results.forEach((result: any) => {
        if (result.exam?._id) completedIds.add(result.exam._id);
        if (result.resultsReleased === false || result.score === null) return;
        const score = result.score || 0;
        const totalMarks = result.totalMarks || 0;
        
        if (totalMarks > 0) {
          const percentage = (score / totalMarks) * 100;
          if (percentage > highestPercentage) {
            highestPercentage = percentage;
            highestScoreDisplay = `${score} / ${totalMarks}`;
          }
        } else if (score > 0 && highestPercentage === -Infinity) {
           highestScoreDisplay = `${score}`;
        }
      });
      
      setCompletedExamIds(completedIds);
      setStats({ 
        totalExams, 
        highestScoreDisplay: highestPercentage === -Infinity && highestScoreDisplay === "0" ? "0" : highestScoreDisplay, 
        highestPercentage: highestPercentage === -Infinity ? 0 : highestPercentage 
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">Welcome back! Here's an overview of your progress and upcoming tasks.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-md">
                <div className="flex items-center gap-3 opacity-80 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium text-sm">Exams Taken</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalExams}</div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-md">
                <div className="flex items-center gap-3 opacity-80 mb-2">
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium text-sm">Highest Score</span>
                </div>
                <div className="text-3xl font-bold flex items-baseline gap-2">
                  {stats.highestScoreDisplay}
                  {stats.highestPercentage > 0 && (
                    <span className="text-lg font-medium opacity-80">
                      ({stats.highestPercentage.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Active Exams */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-indigo-600" />
                Active Exams
              </h2>
              {activeExams.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="text-slate-500 text-sm">No active exams available at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {[...activeExams].sort((a, b) => {
                    const aCompleted = completedExamIds.has(a._id);
                    const bCompleted = completedExamIds.has(b._id);
                    if (aCompleted && !bCompleted) return 1;
                    if (!aCompleted && bCompleted) return -1;
                    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
                  }).map((exam) => (
                    <div
                      key={exam._id}
                      className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 transition-all ${
                        completedExamIds.has(exam._id)
                          ? "ring-emerald-100 opacity-90"
                          : "ring-slate-100 hover:shadow-md hover:ring-indigo-100"
                      }`}
                    >
                      <div>
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

            {/* Upcoming Exams */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-indigo-600" />
                Upcoming Exams
              </h2>
              {upcomingExams.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="text-slate-500 text-sm">No upcoming exams scheduled.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {upcomingExams.map((exam) => (
                    <div
                      key={exam._id}
                      className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 opacity-80"
                    >
                      <div>
                        <div className="mb-4 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {exam.status === "DRAFT" ? "Draft" : "Upcoming"}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{exam.title}</h3>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm font-medium text-indigo-600">
                            <Clock className="mr-2 h-4 w-4" />
                            Exam date: {exam.examDate || new Date(exam.startTime).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <BookOpen className="mr-2 h-4 w-4 text-slate-400" />
                            {exam.duration} Minutes
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button className="w-full" variant="outline" disabled>
                          Not Yet Available
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* Notice Board */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                <Megaphone className="h-5 w-5 text-amber-500" />
                Notice Board
              </h2>
              
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Megaphone className="h-8 w-8 text-slate-200 mb-3" />
                  <p className="text-sm text-slate-500">No new announcements.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <h3 className="font-bold text-slate-900 text-sm">{announcement.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 mb-2">
                        {new Date(announcement.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                      <p className="text-slate-600 text-sm whitespace-pre-wrap">{announcement.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
