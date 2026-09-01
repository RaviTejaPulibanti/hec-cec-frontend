"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuthStore();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "COLLEGE_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const response = await api.post("/auth/signin", data);
      const { user, token } = response.data;
      login(user, token);
      
      if (user.role === "COLLEGE_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50">
        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="Higher Education Cell Logo" width={100} height={100} className="object-contain" priority />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue to your exam portal</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" className="mt-6 w-full" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
