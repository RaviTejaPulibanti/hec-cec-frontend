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
  imageUrl: z.string().optional().or(z.literal("")),
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
  const [imagePreview, setImagePreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditQuestionForm>({
    resolver: zodResolver(editQuestionSchema),
    defaultValues: {
      imageUrl: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
    },
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await api.get(`/questions/${questionId}`);
        const questionData = response.data.data;
        const questionImage = questionData.imageUrl || "";
        setImagePreview(questionImage);
        reset({
          question: questionData.question,
          imageUrl: questionImage,
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
      await api.put(`/questions/${questionId}`, {
        ...data,
        imageUrl: data.imageUrl || "",
      });
      router.push("/admin/questions");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update question");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImagePreview(result);
      setValue("imageUrl", result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview("");
    setValue("imageUrl", "", { shouldValidate: true });
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

          <div className="space-y-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Question Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />

            {imagePreview && (
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <img src={imagePreview} alt="Question preview" className="max-h-72 w-full rounded-xl object-contain" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-white"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

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
