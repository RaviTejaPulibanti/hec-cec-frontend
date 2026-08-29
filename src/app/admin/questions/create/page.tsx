"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/axios";

const createQuestionSchema = z.object({
  question: z.string().min(5, "Question text is required"),
  imageUrl: z.string().optional().or(z.literal("")),
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
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuestionForm>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      imageUrl: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
    }
  });

  const onSubmit = async (data: CreateQuestionForm) => {
    setError("");
    try {
      await api.post("/questions", {
        ...data,
        imageUrl: data.imageUrl || "",
      });
      router.push("/admin/questions");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create question");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImagePreview(result);
      setImageName(file.name);
      setValue("imageUrl", result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview("");
    setImageName("");
    setValue("imageUrl", "", { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
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

          <div className="space-y-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Question Image (optional)
            </label>

            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex w-fit items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                Upload Image
              </button>

              {imageName && !imagePreview && (
                <p className="text-sm text-slate-500">Selected file: {imageName}</p>
              )}
            </div>

            {imagePreview && (
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <img src={imagePreview} alt="Question preview" className="max-h-72 w-full rounded-xl object-contain" />
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 text-xs text-slate-600">
                  <span className="truncate">{imageName || "Question image"}</span>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="rounded-full border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
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
