"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { User, Mail, ShieldCheck, Edit3, BookOpen, GraduationCap, Users, CreditCard } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year || "",
    section: user?.section || user?.studentClass || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.put("/auth/profile", formData);
      // Update local store with new user data
      const token = localStorage.getItem("token") || "";
      login(response.data.user, token);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="mt-2 text-slate-500">View and manage your personal information.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => {
            setFormData({
              name: user?.name || "",
              branch: user?.branch || "",
              year: user?.year || "",
              section: user?.section || user?.studentClass || "",
            });
            setIsEditing(true);
          }} className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-100 bg-slate-50 px-8 py-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-4xl font-bold text-indigo-600 shadow-sm border-4 border-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {error && <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}
          
          <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <User className="h-4 w-4" /> Full Name
              </dt>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-black font-medium bg-white placeholder:text-gray-400"
                />
              ) : (
                <dd className="mt-2 text-base font-medium text-slate-900">{user.name}</dd>
              )}
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <CreditCard className="h-4 w-4" /> ID Number
              </dt>
              <dd className="mt-2 text-base font-medium text-slate-900">{user.idNumber || "Not set"}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Mail className="h-4 w-4" /> Email Address
              </dt>
              <dd className="mt-2 text-base font-medium text-slate-500">{user.email} (Non-editable)</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <BookOpen className="h-4 w-4" /> Branch
              </dt>
              {isEditing ? (
                <Select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  containerClassName="mt-2"
                >
                  <option value="">Select Branch</option>
                  {["CSE", "AIML", "ECE", "EEE", "CIVIL", "MECH"].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
              ) : (
                <dd className="mt-2 text-base font-medium text-slate-900">{user.branch || "Not set"}</dd>
              )}
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <GraduationCap className="h-4 w-4" /> Year
              </dt>
              {isEditing ? (
                <Select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  containerClassName="mt-2"
                >
                  <option value="">Select Year</option>
                  {["E1", "E2", "E3", "E4"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              ) : (
                <dd className="mt-2 text-base font-medium text-slate-900">{user.year || "Not set"}</dd>
              )}
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Users className="h-4 w-4" /> Section
              </dt>
              {isEditing ? (
                <Select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  containerClassName="mt-2"
                >
                  <option value="">Select Section</option>
                  {["A", "B", "C", "D", "E"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              ) : (
                <dd className="mt-2 text-base font-medium text-slate-900">{user.section || user.studentClass || "Not set"}</dd>
              )}
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <ShieldCheck className="h-4 w-4" /> Account Role
              </dt>
              <dd className="mt-2 text-base font-medium capitalize text-slate-500">{user.role.toLowerCase()} (Non-editable)</dd>
            </div>
          </dl>

          {isEditing && (
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
