"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/axios";

const createExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  totalQuestions: z.coerce.number().min(1, "At least 1 question is required"),
  examDate: z.string().nonempty("Exam date is required"),
  securityCode: z.string().min(4, "Security code must be at least 4 characters"),
});

type CreateExamForm = z.infer<typeof createExamSchema>;

export default function CreateExamPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateExamForm>({
    resolver: zodResolver(createExamSchema),
  });

  const onSubmit = async (data: CreateExamForm) => {
    setError("");
    try {
      await api.post("/exam", data);
      router.push("/admin/exams");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create exam");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Exam</h1>
        <p className="mt-2 text-slate-500">Fill in the details to draft a new exam.</p>
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

          <Input
            label="Exam Date"
            type="date"
            error={errors.examDate?.message}
            {...register("examDate")}
          />

          <Input
            label="Security Code"
            type="password"
            placeholder="Enter the code students must know"
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
              Create Exam
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
