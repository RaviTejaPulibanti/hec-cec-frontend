"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get("/questions");
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/questions/${id}`);
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Failed to delete question", error);
      alert("Failed to delete question");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Questions Bank</h1>
          <p className="mt-2 text-slate-500">Manage all questions for your exams.</p>
        </div>
        <Link href="/admin/questions/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Question Text</th>
                <th className="px-6 py-4 font-semibold">Exam</th>
                <th className="px-6 py-4 font-semibold">Marks</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Loading questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No questions found. Add some to get started.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q._id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-md truncate">
                      {q.question}
                    </td>
                    <td className="px-6 py-4">
                      {q.examId?.title || "Unknown Exam"}
                    </td>
                    <td className="px-6 py-4">{q.marks}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/questions/${q._id}/edit`}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
