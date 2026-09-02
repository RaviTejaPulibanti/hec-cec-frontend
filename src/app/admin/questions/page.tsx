"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from "@/lib/axios";
import { Question, Exam } from "@/types";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk Upload State
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInProgressRef = useRef(false);

  useEffect(() => {
    fetchQuestions();
    fetchExams();
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

  const fetchExams = async () => {
    try {
      const response = await api.get("/exam");
      setExams(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch exams", error);
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

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadInProgressRef.current) return;

    if (!selectedExamId) {
      alert("Please select an exam first.");
      return;
    }
    
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Please select a JSON file to upload.");
      return;
    }

    uploadInProgressRef.current = true;
    setUploading(true);
    try {
      const text = await file.text();
      const parsedQuestions = JSON.parse(text);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error("JSON file must contain an array of questions.");
      }

      await api.post("/questions/bulk", {
        examId: selectedExamId,
        questions: parsedQuestions
      });

      alert(`Successfully uploaded ${parsedQuestions.length} questions!`);
      setIsBulkUploadOpen(false);
      setSelectedExamId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchQuestions();
      fetchExams();
    } catch (error: any) {
      console.error("Bulk upload failed", error);
      alert("Upload failed: " + (error.response?.data?.message || error.message));
    } finally {
      uploadInProgressRef.current = false;
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Bulk Upload JSON</h2>
              <button onClick={() => setIsBulkUploadOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Select Exam</label>
                <Select
                  required
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                >
                  <option value="" className="text-slate-500">-- Choose an Exam --</option>
                  {exams.map(exam => (
                    <option key={exam._id} value={exam._id} className="text-slate-900">{exam.title}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">JSON File</label>
                <input
                  type="file"
                  accept=".json"
                  required
                  ref={fileInputRef}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button variant="outline" type="button" className="flex-1" onClick={() => setIsBulkUploadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={uploading}>
                  Upload
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Questions Bank</h1>
          <p className="mt-2 text-slate-500">Manage all questions for your exams.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Link href="/admin/questions/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </Link>
        </div>
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
