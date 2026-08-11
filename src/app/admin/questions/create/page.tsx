"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/axios";

const createQuestionSchema = z.object({
  question: z.string().min(5, "Question text is required"),
  examId: z.string().min(1, "Exam is required"),
  options: z.array(z.string().min(1, "Option text cannot be empty")).length(4),
  correctAnswer: z.coerce.number().min(0).max(3),
  marks: z.coerce.number().min(1, "Marks must be at least 1"),
});

type CreateQuestionForm = z.infer<typeof createQuestionSchema>;

export default function CreateQuestionPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get("/exam");
        if (response.data.success) {
          setExams(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      }
    };
    fetchExams();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuestionForm>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
    }
  });

  const onSubmit = async (data: CreateQuestionForm) => {
    setError("");
    try {
      await api.post("/questions", data);
      router.push("/admin/questions");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create question");
    }
  };

  const selectedExamId = watch("examId");
  const selectedExam = exams.find(e => e._id === selectedExamId);
  const isExamFull = selectedExam && selectedExam.questionCount >= selectedExam.totalQuestions;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Question</h1>
        <p className="mt-2 text-slate-500">Fill in the details to add a new question to the bank.</p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Question Text"
            placeholder="What is the capital of France?"
            error={errors.question?.message}
            {...register("question")}
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Exam
              </label>
              <select
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                {...register("examId")}
              >
                <option value="">Select an Exam</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.title} ({exam.questionCount || 0}/{exam.totalQuestions})
                  </option>
                ))}
              </select>
              {errors.examId && <p className="mt-1.5 text-sm text-red-500">{errors.examId.message}</p>}
              {isExamFull && (
                <p className="mt-1.5 text-sm text-amber-600 font-medium">
                  Maximum number of questions reached for this exam.
                </p>
              )}
            </div>
            <Input
              label="Marks"
              type="number"
              placeholder="1"
              error={errors.marks?.message}
              {...register("marks")}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700">Options</h3>
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                label={`Option ${index + 1}`}
                placeholder={`Option ${index + 1} text...`}
                error={errors.options?.[index]?.message}
                {...register(`options.${index}` as const)}
              />
            ))}
          </div>

          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Correct Answer
            </label>
            <select
              className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              {...register("correctAnswer")}
            >
              <option value={0}>Option 1</option>
              <option value={1}>Option 2</option>
              <option value={2}>Option 3</option>
              <option value={3}>Option 4</option>
            </select>
            {errors.correctAnswer && <p className="mt-1.5 text-sm text-red-500">{errors.correctAnswer.message}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/questions")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isExamFull}>
              Create Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
