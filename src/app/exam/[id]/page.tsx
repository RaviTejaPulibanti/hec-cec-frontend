"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Exam, Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ExamInterfacePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    fetchExamDetails();
    
    // Load saved progress from localStorage
    const savedAnswers = localStorage.getItem(`exam_${id}_answers`);
    const savedIdx = localStorage.getItem(`exam_${id}_currentIdx`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {}
    }
    if (savedIdx) {
      setCurrentQuestionIdx(parseInt(savedIdx, 10) || 0);
    }
  }, [id]);

  useEffect(() => {
    // Save progress to localStorage whenever it changes
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_${id}_answers`, JSON.stringify(answers));
    }
    localStorage.setItem(`exam_${id}_currentIdx`, currentQuestionIdx.toString());
  }, [answers, currentQuestionIdx, id]);

  useEffect(() => {
    if (exam && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exam, timeLeft, isFinished]);

  const fetchExamDetails = async () => {
    try {
      const response = await api.get(`/student/exams/${id}`);
      const fetchedExam = response.data.data;
      setExam(fetchedExam);
      
      setQuestions(fetchedExam.questions || []);
      
      const now = Date.now();
      const endTime = new Date(fetchedExam.endTime).getTime();
      const secondsUntilEnd = Math.max(0, Math.floor((endTime - now) / 1000));
      const allowedDurationSeconds = fetchedExam.duration * 60;
      
      setTimeLeft(Math.min(allowedDurationSeconds, secondsUntilEnd));
    } catch (error) {
      console.error("Failed to load exam", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers({ ...answers, [questionId]: optionIdx });
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      // API call to submit results
      const formattedAnswers = Object.entries(answers).map(([questionId, optionIdx]) => ({
        question: questionId,
        selectedOption: optionIdx,
      }));
      
      await api.post(`/student/exams/${id}/submit`, { answers: formattedAnswers });
      
      // Clear saved progress
      localStorage.removeItem(`exam_${id}_answers`);
      localStorage.removeItem(`exam_${id}_currentIdx`);
      
      setIsFinished(true);
    } catch (error) {
      console.error("Submit failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading exam...</div>;
  }

  if (isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md text-center rounded-2xl bg-white p-8 shadow-xl">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          <h2 className="text-2xl font-bold text-slate-900">Exam Submitted!</h2>
          <p className="mt-2 text-slate-500">Your results have been recorded successfully.</p>
          <Button className="mt-8 w-full" onClick={() => router.push("/dashboard/results")}>
            View Results
          </Button>
        </div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return <div className="flex min-h-screen items-center justify-center">Error loading exam data.</div>;
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{exam.title}</h1>
          <p className="text-xs text-slate-500">{exam.subject}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-lg font-semibold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-900'}`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="danger" size="sm" onClick={handleSubmitExam} isLoading={isSubmitting}>
            Submit Exam
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-8 p-6">
        {/* Main Content */}
        <div className="flex-1 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-semibold text-slate-900">Question {currentQuestionIdx + 1} of {questions.length}</h2>
            <div className="text-sm font-medium text-slate-500">Marks: {currentQ.marks} | Negative: -{currentQ.negativeMarks}</div>
          </div>
          
          <div className="mb-8 text-lg text-slate-900 leading-relaxed">
            {currentQ.question}
          </div>

          <div className="space-y-4">
            {currentQ.options.map((option, idx) => {
              const isSelected = answers[currentQ._id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(currentQ._id, idx)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium ${
                      isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-500"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-base ${isSelected ? "font-medium text-indigo-900" : "text-slate-700"}`}>
                      {option}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-between">
            <Button
              variant="outline"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={currentQuestionIdx === questions.length - 1}
              onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="w-80 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 hidden lg:block">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q._id] !== undefined;
              const isCurrent = idx === currentQuestionIdx;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="h-4 w-4 rounded bg-emerald-100" /> Answered
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="h-4 w-4 rounded bg-slate-100" /> Not Answered
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="h-4 w-4 rounded bg-indigo-600" /> Current
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
