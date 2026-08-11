"use client";

import React, { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/axios";

const editExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  totalQuestions: z.coerce.number().min(1, "At least 1 question is required"),
  startTime: z.string().nonempty("Start time is required"),
  endTime: z.string().nonempty("End time is required"),
});

type EditExamForm = z.infer<typeof editExamSchema>;

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
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
        
        // Format dates for datetime-local input
        const formatDateTime = (dateString: string) => {
          if (!dateString) return "";
          const d = new Date(dateString);
          // Format as YYYY-MM-DDThh:mm
          return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        };

        reset({
          title: exam.title,
          duration: exam.duration,
          totalQuestions: exam.totalQuestions,
          startTime: formatDateTime(exam.startTime),
          endTime: formatDateTime(exam.endTime),
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

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Start Time"
              type="datetime-local"
              error={errors.startTime?.message}
              {...register("startTime")}
            />
            <Input
              label="End Time"
              type="datetime-local"
              error={errors.endTime?.message}
              {...register("endTime")}
            />
          </div>

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
