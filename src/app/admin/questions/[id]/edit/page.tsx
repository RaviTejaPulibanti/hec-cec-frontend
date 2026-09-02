"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/axios";

const editQuestionSchema = z.object({
  question: z.string().min(5, "Question text is required"),
  imageUrl: z.string().optional().or(z.literal("")),
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
  const [examId, setExamId] = useState("");
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
        const questionExamId = questionData.examId?._id || questionData.examId;
        setExamId(questionExamId);
        setImagePreview(questionImage);
        reset({
          question: questionData.question,
          imageUrl: questionImage,
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
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, reset]);

  const onSubmit = async (data: EditQuestionForm) => {
    setError("");
    try {
      await api.put(`/questions/${questionId}`, {
        ...data,
        imageUrl: data.imageUrl || "",
      });
      router.push(examId ? `/admin/exams/${examId}/edit` : "/admin/exams");
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

          <div>
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
            <Select {...register("correctAnswer")}>
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
            </Select>
            {errors.correctAnswer && <p className="mt-1.5 text-sm text-red-500">{errors.correctAnswer.message}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(examId ? `/admin/exams/${examId}/edit` : "/admin/exams")}
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
