"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, User as UserIcon, AlertCircle, BookOpen, GraduationCap, Users } from "lucide-react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import Image from "next/image";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().regex(/^[snor]\d{6}@rguktsklm\.ac\.in$/i, "only college emails are allowed"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  branch: z.enum(["CSE", "AIML", "ECE", "EEE", "CIVIL", "MECH"], { message: "Select a branch" }),
  year: z.enum(["E1", "E2", "E3", "E4"], { message: "Select a year" }),
  section: z.enum(["A", "B", "C", "D", "E"], { message: "Select a section" }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    try {
      const response = await api.post("/auth/signup", data);
      const { user, token } = response.data;
      login(user, token);
      
      if (user.role === "COLLEGE_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:grid-cols-[1.05fr_1.3fr]">
        <aside className="relative overflow-hidden bg-gradient-to-br from-[#a14e40] via-[#8a3f33] to-[#2b3a52] p-8 text-white lg:p-10">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-[#f7d7c9]/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Image src="/logo.png" alt="Higher Education Cell Logo" width={28} height={28} className="object-contain" priority />
                </div>
                <span className="text-sm font-medium tracking-[0.12em] uppercase text-white/80">HEC Portal</span>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">Welcome</p>
                <h1 className="text-4xl font-bold leading-tight">Create your student account</h1>
                <p className="max-w-sm text-base text-white/80">
                  Join the academic platform to access exams, results, announcements, and peer performance insights.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              {[
                "Track your academic progress",
                "Participate in exam activities",
                "Stay updated with campus announcements",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm text-white">✓</div>
                  <span className="text-sm text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a14e40]">Register</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Get started</h2>
            <p className="mt-2 text-sm text-slate-500">Fill in your details to create a secure account.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                icon={<UserIcon className="h-5 w-5" />}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="s220001@rguktsklm.ac.in"
                icon={<Mail className="h-5 w-5" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Branch</span>
                <select className={`flex h-12 w-full rounded-xl border bg-slate-50/80 px-4 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 focus-visible:border-[#a14e40] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a14e40]/20 ${
                  errors.branch ? "border-red-300 bg-red-50/70" : "border-slate-200"
                }`} {...register("branch")}>
                  <option value="">Select</option>
                  {['CSE', 'AIML', 'ECE', 'EEE', 'MECH', 'CIVIL'].map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                </select>
                {errors.branch && <span className="mt-1 block text-xs text-red-600">{errors.branch.message}</span>}
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Year</span>
                <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 focus-visible:border-[#a14e40] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a14e40]/20" {...register("year")}>
                  <option value="">Select</option>
                  {['E1', 'E2', 'E3', 'E4'].map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
                {errors.year && <span className="mt-1 block text-xs text-red-600">{errors.year.message}</span>}
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Section</span>
                <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 focus-visible:border-[#a14e40] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a14e40]/20" {...register("section")}>
                  <option value="">Select</option>
                  {["A", "B", "C", "D", "E"].map((section) => <option key={section} value={section}>{section}</option>)}
                </select>
                {errors.section && <span className="mt-1 block text-xs text-red-600">{errors.section.message}</span>}
              </label>
            </div>

            <Button type="submit" className="mt-6 w-full" size="lg" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#a14e40] transition-colors hover:text-[#8a3f33]">
              Sign in instead
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
