"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Exam, Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Clock, AlertTriangle, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";

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
  const [securityCode, setSecurityCode] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  
  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const isSubmittingRef = React.useRef(false);

  const handleSubmitExam = async () => {
    if (isSubmittingRef.current || isFinished) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      // API call to submit results
      const formattedAnswers = Object.entries(answersRef.current).map(([questionId, optionIdx]) => ({
        question: questionId,
        selectedOption: optionIdx,
      }));
      
      const allowedDurationSeconds = exam ? exam.duration * 60 : 0;
      const timeTaken = Math.max(0, allowedDurationSeconds - timeLeft);
      
      await api.post(`/student/exams/${id}/submit`, { answers: formattedAnswers, timeTaken }, {
        headers: { "x-exam-access-token": accessToken },
      });
      
      // Clear saved progress
      localStorage.removeItem(`exam_${id}_answers`);
      localStorage.removeItem(`exam_${id}_currentIdx`);
      localStorage.removeItem(`exam_${id}_endTime`);
      
      setIsFinished(true);
    } catch (error: any) {
      console.error("Submit failed", error);
      if (error.response && error.response.status === 400 && error.response.data?.message?.includes("already submitted")) {
        // Exam was already submitted (e.g. by a background blur event before reload)
        localStorage.removeItem(`exam_${id}_answers`);
        localStorage.removeItem(`exam_${id}_currentIdx`);
        localStorage.removeItem(`exam_${id}_endTime`);
        setIsFinished(true);
      } else if (error.response && error.response.status === 500 && error.response.data?.message?.includes("E11000")) {
        // Handle MongoDB duplicate key error silently
        localStorage.removeItem(`exam_${id}_answers`);
        localStorage.removeItem(`exam_${id}_currentIdx`);
        localStorage.removeItem(`exam_${id}_endTime`);
        setIsFinished(true);
      } else {
        alert(error.response?.data?.message || "Failed to submit exam. Please try again.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const [submittedDueToViolation, setSubmittedDueToViolation] = useState(false);

  useEffect(() => {
    if (!accessToken || isFinished || isSubmitting) return;

    // Prevent accidental reload/leave
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Detect focus loss (tab switching, alt-tab, clicking outside)
    const handleBlur = () => {
      setSubmittedDueToViolation(true);
      handleSubmitExam();
    };

    // Prevent back navigation
    const handlePopState = (e: PopStateEvent) => {
      history.pushState(null, "", window.location.href);
      setSubmittedDueToViolation(true);
      handleSubmitExam();
    };

    history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFinished, isSubmitting]);

  useEffect(() => {
    const savedAccessToken = localStorage.getItem(`exam_${id}_accessToken`);
    if (savedAccessToken) {
      setAccessToken(savedAccessToken);
      fetchExamDetails(savedAccessToken);
    } else {
      setLoading(false);
    }
    
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

  const fetchExamDetails = async (token: string) => {
    try {
      const response = await api.get(`/student/exams/${id}`, {
        headers: { "x-exam-access-token": token },
      });
      const fetchedExam = response.data.data;
      setExam(fetchedExam);
      
      setQuestions(fetchedExam.questions || []);
      
      const now = Date.now();
      const endTime = new Date(fetchedExam.endTime).getTime();
      const secondsUntilEnd = Math.max(0, Math.floor((endTime - now) / 1000));
      const allowedDurationSeconds = fetchedExam.duration * 60;
      
      let savedEndTime = localStorage.getItem(`exam_${id}_endTime`);
      let finalSecondsLeft = 0;
      
      if (savedEndTime) {
        finalSecondsLeft = Math.max(0, Math.floor((parseInt(savedEndTime) - now) / 1000));
      } else {
        finalSecondsLeft = Math.min(allowedDurationSeconds, secondsUntilEnd);
        localStorage.setItem(`exam_${id}_endTime`, (now + finalSecondsLeft * 1000).toString());
      }
      
      setTimeLeft(finalSecondsLeft);
    } catch (error) {
      console.error("Failed to load exam", error);
      localStorage.removeItem(`exam_${id}_accessToken`);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsVerifying(true);
    setVerificationError("");

    try {
      const response = await api.post(`/student/exams/${id}/verify-code`, { securityCode });
      const token = response.data.data.accessToken as string;
      if(token == null){
        alert("Invalid Code");
        router.replace("/dashboard");
        return;
      }
      localStorage.setItem(`exam_${id}_accessToken`, token);
      setAccessToken(token);
      await fetchExamDetails(token);
    } catch (error: any) {
      if (error.response?.data?.message === "Invalid security code") {
        alert("Invalid Code");
        router.replace("/dashboard");
        return;
      }
      setVerificationError(error.response?.data?.message || "Unable to verify the security code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers({ ...answers, [questionId]: optionIdx });
  };



  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading exam...</div>;
  }

  if (!accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">Secure exam access</p>
          <h1 className="text-2xl font-bold text-slate-900">Enter your security code</h1>
          <p className="mt-2 text-slate-500">Verify the code provided for this exam to continue.</p>
          <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
            <Input
              label="Security code"
              type="password"
              autoComplete="off"
              value={securityCode}
              onChange={(event) => setSecurityCode(event.target.value)}
              icon={<KeyRound className="h-4 w-4" />}
              error={verificationError}
            />
            <Button type="submit" className="w-full" isLoading={isVerifying} disabled={!securityCode.trim()}>
              Verify and start exam
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md text-center rounded-2xl bg-white p-8 shadow-xl">
          {submittedDueToViolation ? (
            <>
              <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h2 className="text-2xl font-bold text-red-600">Exam Auto-Submitted!</h2>
              <p className="mt-2 text-slate-600 font-medium">
                Your exam was automatically submitted because you switched tabs, lost focus, or attempted to navigate away.
              </p>
              <p className="mt-2 text-sm text-slate-500">This action is strictly prohibited during the exam.</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
              <h2 className="text-2xl font-bold text-slate-900">Exam Submitted!</h2>
              <p className="mt-2 text-slate-500">Your results have been recorded successfully.</p>
            </>
          )}
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
    <div className="flex min-h-screen flex-col bg-slate-50 relative">
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
          
          <div className="mb-6 text-lg leading-relaxed text-slate-900">
            {currentQ.question}
          </div>

          {currentQ.imageUrl ? (
            <div className="mb-8 flex justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex max-w-3xl justify-center">
                <img
                  src={currentQ.imageUrl}
                  alt="Question diagram"
                  className="max-h-[460px] w-full rounded-xl object-contain shadow-sm"
                />
              </div>
            </div>
          ) : null}

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
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                      isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-500"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`break-words text-base ${isSelected ? "font-medium text-indigo-900" : "text-slate-700"}`}>
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
              disabled={isSubmitting}
              onClick={() => {
                if (currentQuestionIdx === questions.length - 1) {
                  handleSubmitExam();
                  return;
                }

                setCurrentQuestionIdx(prev => prev + 1);
              }}
            >
              {currentQuestionIdx === questions.length - 1 ? "Submit Exam" : "Next"}
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
