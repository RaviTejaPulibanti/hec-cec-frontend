"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Exam } from "@/types";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit2, Trash2, Send, Ban, Eye, EyeOff } from "lucide-react";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      // Backend routes from examroutes.ts
      const response = await api.get("/exam");
      setExams(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch exams", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exams</h1>
          <p className="mt-2 text-slate-500">Manage all your platform exams.</p>
        </div>
        <Link href="/admin/exams/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Results</th>
                <th className="px-6 py-4 font-semibold">Duration (min)</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading exams...
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No exams found. Create one to get started.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => {
                  const now = Date.now();
                  const isAutoReleased = exam.resultReleaseMode === "IMMEDIATE" || 
                    (exam.resultReleaseMode === "AFTER_EXAM" && (exam.status === "COMPLETED" || new Date(exam.endTime).getTime() <= now));
                  const isReleased = exam.resultsReleased || isAutoReleased;

                  return (
                    <tr key={exam._id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{exam.title}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            exam.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : exam.status === "DRAFT"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isReleased
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {exam.resultsReleased
                            ? "Released (Manual)"
                            : exam.resultReleaseMode === "IMMEDIATE"
                            ? "Immediate"
                            : isAutoReleased
                            ? "Released (Ended)"
                            : "Withheld"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{exam.duration}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.patch(`/exam/${exam._id}/toggle-results-release`);
                                alert(res.data.message);
                                fetchExams();
                              } catch (err: any) {
                                alert(err.response?.data?.message || "Failed to toggle result release");
                              }
                            }}
                            title={exam.resultsReleased ? "Hide Results from Students" : "Release Results to Students"}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                              exam.resultsReleased
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            }`}
                          >
                            {exam.resultsReleased ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span>{exam.resultsReleased ? "Hide Results" : "Release Results"}</span>
                          </button>

                          {exam.status === "DRAFT" && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.patch(`/exam/${exam._id}/publish`);
                                  fetchExams();
                                } catch (err: any) {
                                  alert(err.response?.data?.message || "Failed to publish exam");
                                }
                              }}
                              title="Publish Exam"
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-100 hover:text-emerald-600"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          {exam.status === "PUBLISHED" && (
                            <button
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to revoke publish? This will move the exam back to DRAFT status.")) {
                                  try {
                                    await api.patch(`/exam/${exam._id}/unpublish`);
                                    fetchExams();
                                  } catch (err: any) {
                                    alert(err.response?.data?.message || "Failed to unpublish exam");
                                  }
                                }
                              }}
                              title="Revoke Publish"
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          <Link 
                            href={`/admin/exams/${exam._id}/edit`}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 inline-block"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this exam?")) {
                                try {
                                  await api.delete(`/exam/${exam._id}`);
                                  setExams(exams.filter(e => e._id !== exam._id));
                                } catch (err) {
                                  console.error("Failed to delete exam", err);
                                  alert("Failed to delete exam.");
                                }
                              }
                            }}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
