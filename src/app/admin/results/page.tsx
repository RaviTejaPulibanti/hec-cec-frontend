"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { api } from "@/lib/axios";
import { Exam } from "@/types";
import { Select } from "@/components/ui/Select";

interface AdminResult {
  _id: string;
  score: number;
  totalMarks?: number;
  student?: {
    name?: string;
    idNumber?: string;
    branch?: string;
    year?: string;
    section?: string;
  };
}

export default function AdminResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState<AdminResult[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get("/exam");
        setExams(response.data.data || []);
      } catch {
        setError("Failed to load exams.");
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoadingResults(true);
      setError("");
      try {
        const response = await api.get(`/admin/results/${selectedExamId}`);
        setResults(response.data.data || []);
      } catch {
        setError("Failed to load results for this exam.");
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchResults();
  }, [selectedExamId]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e2f2ef] text-[#176d6a]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Results</h1>
            <p className="mt-1 text-slate-500">View student marks by exam.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <label htmlFor="exam-select" className="mb-2 block text-sm font-semibold text-slate-900">
          Select exam
        </label>
        <Select
          id="exam-select"
          value={selectedExamId}
          onChange={(event) => setSelectedExamId(event.target.value)}
          disabled={loadingExams}
          containerClassName="max-w-xl"
        >
          <option value="">Choose an exam to view results</option>
          {exams.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.title}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">ID Number</th>
                <th className="px-6 py-4 font-semibold">Branch</th>
                <th className="px-6 py-4 font-semibold">Year</th>
                <th className="px-6 py-4 font-semibold">Section</th>
                <th className="px-6 py-4 font-semibold text-right">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingResults ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">Loading results...</td></tr>
              ) : !selectedExamId ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Select an exam to view student marks.</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No results submitted for this exam.</td></tr>
              ) : (
                results.map((result) => (
                  <tr key={result._id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-medium text-slate-900">{result.student?.name || "Unknown student"}</td>
                    <td className="px-6 py-4">{result.student?.idNumber || "-"}</td>
                    <td className="px-6 py-4">{result.student?.branch || "-"}</td>
                    <td className="px-6 py-4">{result.student?.year || "-"}</td>
                    <td className="px-6 py-4">{result.student?.section || "-"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[#176d6a]">
                      {result.score}{result.totalMarks ? ` / ${result.totalMarks}` : ""}
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