"use client";

import React, { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/axios";
import { Upload } from "lucide-react";

const questionSchema = z.object({
  question: z.string().min(5, "Question text is required"),
  imageUrl: z.string().optional().or(z.literal("")),
  options: z.array(z.string().min(1, "Option text cannot be empty")).length(4),
  correctAnswer: z.coerce.number().int().min(0).max(3),
  marks: z.coerce.number().min(1, "Marks must be at least 1"),
  negativeMarks: z.coerce.number().min(0),
});

const createExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  totalQuestions: z.coerce.number().min(1, "At least 1 question is required"),
  examDate: z.string().nonempty("Exam date is required"),
  endDate: z.string().nonempty("End date is required"),
  securityCode: z.string().min(4, "Security code must be at least 4 characters"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

type CreateExamForm = z.infer<typeof createExamSchema>;

export default function CreateExamPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [questionImagePreviews, setQuestionImagePreviews] = useState<Record<number, { dataUrl: string; name: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateExamForm>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1, negativeMarks: 0 }],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({ control, name: "questions" });

  const handleQuestionsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("JSON must contain a non-empty array of questions.");
      }

      const result = z.array(questionSchema).safeParse(parsed);
      if (!result.success) {
        throw new Error("Each question needs text, 4 options, a valid answer index, marks, and negative marks.");
      }

      replace(result.data);
      setValue("totalQuestions", result.data.length, { shouldValidate: true });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not read the JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleQuestionImageUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setQuestionImagePreviews((prev) => ({
        ...prev,
        [index]: { dataUrl: result, name: file.name },
      }));
      setValue(`questions.${index}.imageUrl`, result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const clearQuestionImage = (index: number) => {
    setQuestionImagePreviews((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setValue(`questions.${index}.imageUrl`, "", { shouldValidate: true });
  };

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
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register("endDate")}
          />

          <div className="space-y-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Exam Questions</h2>
                <p className="mt-1 text-sm text-slate-500">Add exactly the number of questions selected above.</p>
              </div>
              <span className="text-sm font-medium text-slate-500">{fields.length} added</span>
            </div>

            <div className="flex justify-end">
              <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#176d6a] ring-1 ring-[#b8d8d5] transition hover:bg-[#e2f2ef]">
                <Upload className="h-4 w-4" />
                Bulk Upload
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleQuestionsUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Question {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => remove(index)}>Remove</Button>
                  )}
                </div>
                <Input
                  label="Question Text"
                  placeholder="Enter the question"
                  error={errors.questions?.[index]?.question?.message}
                  {...register(`questions.${index}.question` as const)}
                />

                <div className="space-y-3">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Question Image (optional)
                  </label>

                  <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(event) => handleQuestionImageUpload(event, index)}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>

                  {questionImagePreviews[index] && (
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <img
                        src={questionImagePreviews[index].dataUrl}
                        alt={`Question ${index + 1} preview`}
                        className="max-h-60 w-full rounded-xl object-contain"
                      />
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 text-xs text-slate-600">
                        <span className="truncate">{questionImagePreviews[index].name || "Question image"}</span>
                        <button
                          type="button"
                          onClick={() => clearQuestionImage(index)}
                          className="rounded-full border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((optionIndex) => (
                    <Input
                      key={optionIndex}
                      label={`Option ${optionIndex + 1}`}
                      placeholder={`Option ${optionIndex + 1}`}
                      error={errors.questions?.[index]?.options?.[optionIndex]?.message}
                      {...register(`questions.${index}.options.${optionIndex}` as const)}
                    />
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Correct Answer</label>
                    <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm" {...register(`questions.${index}.correctAnswer` as const)}>
                      <option value={0}>Option 1</option><option value={1}>Option 2</option><option value={2}>Option 3</option><option value={3}>Option 4</option>
                    </select>
                  </div>
                  <Input label="Marks" type="number" min="1" {...register(`questions.${index}.marks` as const)} />
                  <Input label="Negative Marks" type="number" min="0" step="0.25" {...register(`questions.${index}.negativeMarks` as const)} />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={() => append({ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1, negativeMarks: 0 })}>
              Add Question
            </Button>
          </div>

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
