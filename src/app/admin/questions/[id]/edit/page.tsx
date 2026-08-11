"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/axios";

const editQuestionSchema = z.object({
  question: z.string().min(5, "Question text is required"),
  examId: z.string().min(1, "Exam is required"),
  options: z.array(z.string().min(1, "Option text cannot be empty")).length(4),
  correctAnswer: z.coerce.number().min(0).max(3),
  marks: z.coerce.number().min(1, "Marks must be at least 1"),
});

type EditQuestionForm = z.infer<typeof editQuestionSchema>;

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditQuestionForm>({
    resolver: zodResolver(editQuestionSchema),
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await api.get(`/questions/${questionId}`);
        const questionData = response.data.data;
        reset({
          question: questionData.question,
          examId: questionData.examId?._id || questionData.examId,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          marks: questionData.marks,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };
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
    if (questionId) {
      fetchQuestion();
      fetchExams();
    }
  }, [questionId, reset]);

  const onSubmit = async (data: EditQuestionForm) => {
    setError("");
    try {
      await api.put(`/questions/${questionId}`, data);
      router.push("/admin/questions");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update question");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading question details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Question</h1>
        <p className="mt-2 text-slate-500">Update the details for this question.</p>
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
                  <option key={exam._id} value={exam._id}>{exam.title}</option>
                ))}
              </select>
              {errors.examId && <p className="mt-1.5 text-sm text-red-500">{errors.examId.message}</p>}
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
            <Button type="submit" isLoading={isSubmitting}>
              Update Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
