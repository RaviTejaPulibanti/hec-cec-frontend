"use client";

import React, { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/axios";
import Link from "next/link";
import { Edit2 } from "lucide-react";

const editExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  totalQuestions: z.coerce.number().min(1, "At least 1 question is required"),
  examDate: z.string().nonempty("Exam date is required"),
  endDate: z.string().nonempty("End date is required"),
  securityCode: z.string().min(4, "Security code must be at least 4 characters").optional().or(z.literal("")),
});

type EditExamForm = z.infer<typeof editExamSchema>;

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Array<{ _id: string; question: string }>>([]);
  
  // React 19 / Next 15 pattern for unrolling promises
  const { id } = use(params);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditExamForm>({
    resolver: zodResolver(editExamSchema),
  });

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await api.get(`/exam/${id}`);
        const exam = response.data.data;
        setQuestions(exam.questions || []);
        
        reset({
          title: exam.title,
          duration: exam.duration,
          totalQuestions: exam.totalQuestions,
          examDate: exam.examDate || new Date(exam.startTime).toISOString().slice(0, 10),
          endDate: exam.endDate || new Date(exam.endTime).toISOString().slice(0, 10),
          securityCode: "",
        });
      } catch (err: any) {
        console.error(err);
        setError("Failed to load exam details.");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id, reset]);

  const onSubmit = async (data: EditExamForm) => {
    setError("");
    try {
      await api.put(`/exam/${id}`, data);
      router.push("/admin/exams");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update exam");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
        <p className="text-slate-500">Loading exam details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Exam</h1>
        <p className="mt-2 text-slate-500">Update the details for this exam.</p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Exam Questions</h2>
              <p className="mt-1 text-sm text-slate-500">Edit the questions currently assigned to this exam.</p>
            </div>
            <span className="text-sm font-medium text-slate-500">{questions.length} questions</span>
          </div>

          {questions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {questions.map((question, index) => (
                <div key={question._id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="min-w-0 truncate text-sm font-medium text-slate-700">
                    <span className="mr-2 text-slate-400">{index + 1}.</span>
                    {question.question}
                  </p>
                  <Link href={`/admin/questions/${question._id}/edit`}>
                    <Button type="button" variant="outline" size="sm">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No questions have been added yet.</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Exam Title"
            placeholder="Midterm Examination"
            error={errors.title?.message}
            {...register("title")}
          />

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Duration (minutes)"
              type="number"
              placeholder="60"
              error={errors.duration?.message}
              {...register("duration")}
            />
            <Input
              label="Total Questions"
              type="number"
              placeholder="50"
              error={errors.totalQuestions?.message}
              {...register("totalQuestions")}
            />
          </div>

          <Input
            label="Exam Date"
            type="date"
            error={errors.examDate?.message}
            {...register("examDate")}
          />

          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register("endDate")}
          />

          <Input
            label="Security Code"
            type="password"
            placeholder="Leave blank to keep the current code"
            error={errors.securityCode?.message}
            {...register("securityCode")}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/exams")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Update Exam
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
