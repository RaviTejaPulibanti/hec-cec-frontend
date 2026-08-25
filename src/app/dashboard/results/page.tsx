"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Award, Target, TrendingUp, CheckCircle2, XCircle, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailedResult, setDetailedResult] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardExamId, setLeaderboardExamId] = useState<string | null>(null);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    if (isLeaderboardOpen && leaderboardExamId) {
      const delayDebounceFn = setTimeout(() => {
        fetchLeaderboard();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [isLeaderboardOpen, leaderboardExamId, leaderboardPage, leaderboardSearch]);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const response = await api.get(`/student/exams/${leaderboardExamId}/leaderboard`, {
        params: {
          page: leaderboardPage,
          limit: 10,
          search: leaderboardSearch
        }
      });
      setLeaderboardData(response.data.data);
      setLeaderboardTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const openLeaderboard = (examId: string) => {
    setLeaderboardExamId(examId);
    setLeaderboardPage(1);
    setLeaderboardSearch("");
    setIsLeaderboardOpen(true);
  };

  const fetchResults = async () => {
    try {
      const response = await api.get("/student/results");
      setResults(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch results", error);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (resultId: string) => {
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/student/results/${resultId}`);
      setDetailedResult(response.data.data);
    } catch (error) {
      console.error("Failed to fetch detailed result", error);
      alert("Failed to load details. Ensure backend is updated and restarted.");
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const progressSummary = results.reduce(
    (summary, result) => {
      const totalMarks = Number(result.totalMarks) || 0;
      const score = Number(result.score) || 0;

      return {
        earnedMarks: summary.earnedMarks + score,
        totalMarks: summary.totalMarks + totalMarks,
        correctAnswers: summary.correctAnswers + (Number(result.correctAnswers) || 0),
        wrongAnswers: summary.wrongAnswers + (Number(result.wrongAnswers) || 0),
        unattempted: summary.unattempted + (Number(result.unattempted) || 0),
      };
    },
    { earnedMarks: 0, totalMarks: 0, correctAnswers: 0, wrongAnswers: 0, unattempted: 0 }
  );
  const progressPercentage = progressSummary.totalMarks > 0
    ? Math.max(0, Math.min(100, Math.round((progressSummary.earnedMarks / progressSummary.totalMarks) * 100)))
    : 0;
  const progressRing = `${progressPercentage} ${100 - progressPercentage}`;

  return (
    <div className="space-y-8 relative">
      {/* Detailed Result Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Exam Review</h2>
                {detailedResult && (
                  <p className="text-sm text-slate-500 mt-1">
                    {detailedResult.exam?.title} • Score: {detailedResult.score}
                  </p>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {loadingDetails ? (
                <div className="flex justify-center items-center h-40 text-slate-500">Loading exam details...</div>
              ) : detailedResult && detailedResult.allQuestions ? (
                <div className="space-y-6">
                  {detailedResult.allQuestions.map((q: any, idx: number) => {
                    const ans = detailedResult.answers.find((a: any) => 
                      (a.question && a.question._id === q._id) || a.question === q._id
                    );
                    const isAttempted = !!ans;
                    const isCorrectOverall = isAttempted && ans.selectedOption === q.correctAnswer;
                    
                    return (
                      <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6 gap-4">
                          <h3 className="font-medium text-slate-900 text-lg leading-relaxed">
                            <span className="text-slate-400 mr-2">{idx + 1}.</span> 
                            {q.question}
                          </h3>
                          <div className="flex-shrink-0">
                            {!isAttempted ? (
                              <div className="flex items-center text-slate-500 gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                <span className="text-sm font-semibold">Not Attempted</span>
                              </div>
                            ) : isCorrectOverall ? (
                              <div className="flex items-center text-emerald-600 gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4"/> 
                                <span className="text-sm font-semibold">Correct</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600 gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                                <XCircle className="w-4 h-4"/> 
                                <span className="text-sm font-semibold">Incorrect</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {q.options.map((opt: string, oIdx: number) => {
                            const isSelected = isAttempted && ans.selectedOption === oIdx;
                            const isCorrectOption = q.correctAnswer === oIdx;
                            
                            let styling = "border-slate-200 bg-white hover:border-slate-300";
                            let iconStyling = "text-slate-500 border-slate-300";
                            let textStyling = "text-slate-700";

                            if (isCorrectOption) {
                              styling = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
                              iconStyling = "bg-emerald-500 text-white border-emerald-500";
                              textStyling = "text-emerald-900 font-medium";
                            } else if (isSelected && !isCorrectOption) {
                              styling = "border-red-500 bg-red-50 ring-1 ring-red-500";
                              iconStyling = "bg-red-500 text-white border-red-500";
                              textStyling = "text-red-900 font-medium";
                            }

                            return (
                              <div key={oIdx} className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${styling}`}>
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium flex-shrink-0 ${iconStyling}`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <span className={`${textStyling} text-base`}>{opt}</span>
                                {isCorrectOption && isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" />
                                )}
                                {!isCorrectOption && isSelected && (
                                  <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />
                                )}
                                {isCorrectOption && !isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0 opacity-50" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">No detailed answers available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  🏆 Exam Leaderboard
                </h2>
              </div>
              <button onClick={() => setIsLeaderboardOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <input
                type="text"
                placeholder="Search by student name..."
                className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={leaderboardSearch}
                onChange={(e) => {
                  setLeaderboardSearch(e.target.value);
                  setLeaderboardPage(1);
                }}
              />
            </div>

            <div className="p-0 overflow-y-auto flex-1">
              {loadingLeaderboard ? (
                <div className="flex justify-center items-center h-40 text-slate-500">Loading leaderboard...</div>
              ) : leaderboardData.length > 0 ? (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 sticky top-0">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">Rank</th>
                      <th className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">Student Name</th>
                      <th className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">Score</th>
                      <th className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboardData.map((item, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          {item.rank === 1 ? "🥇 1" : item.rank === 2 ? "🥈 2" : item.rank === 3 ? "🥉 3" : item.rank}
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{item.name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                            {item.score}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-slate-500 whitespace-nowrap">
                          {item.timeTaken ? `${Math.floor(item.timeTaken / 60)}m ${item.timeTaken % 60}s` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-slate-500">No students found.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={leaderboardPage <= 1}
                onClick={() => setLeaderboardPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500 font-medium text-center">Page {leaderboardPage} of {leaderboardTotalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={leaderboardPage >= leaderboardTotalPages}
                onClick={() => setLeaderboardPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Results</h1>
        <p className="mt-2 text-slate-500">Track your performance and past exam scores.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 flex-shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Exams Taken</p>
            <p className="text-2xl font-bold text-slate-900">{results.length || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Highest Score</p>
            <p className="text-2xl font-bold text-slate-900">
              {results.length > 0 
                ? (() => {
                    const highest = results.reduce((max, r) => (r.score > max.score ? r : max), results[0]);
                    return `${highest.score} / ${highest.totalMarks}`;
                  })()
                : "--"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:col-span-2 lg:col-span-1">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-label={`${progressPercentage}% overall progress`} role="img">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={progressRing}
                className="text-emerald-500 transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900">{progressPercentage}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Overall Progress</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{progressSummary.correctAnswers} correct answers</p>
            <p className="mt-1 text-xs text-slate-500">
              {progressSummary.wrongAnswers} wrong · {progressSummary.unattempted} unattempted
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">Exam Title</th>
                <th className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">Date Taken</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-right whitespace-nowrap">Score</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-center whitespace-nowrap">Performance</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-right whitespace-nowrap">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No results found. Take an exam to see your scores here.
                  </td>
                </tr>
              ) : (
                results.map((result, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{result.exam?.title || `Exam #${idx+1}`}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(result.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        {result.score} / {result.totalMarks}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {(() => {
                        const score = Number(result.score) || 0;
                        const totalMarks = Number(result.totalMarks) || 0;
                        const performance = totalMarks > 0
                          ? Math.max(0, Math.min(100, Math.round((score / totalMarks) * 100)))
                          : 0;

                        return (
                          <div className="relative mx-auto h-12 w-12" role="img" aria-label={`${performance}% performance`}>
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
                              <circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                pathLength="100"
                                strokeDasharray={`${performance} ${100 - performance}`}
                                className="text-emerald-500 transition-all duration-700"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">{performance}%</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => openLeaderboard(result.exam?._id)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 whitespace-nowrap">
                          🏆 Leaderboard
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDetails(result._id)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 whitespace-nowrap">
                          <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                        </Button>
                      </div>
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
