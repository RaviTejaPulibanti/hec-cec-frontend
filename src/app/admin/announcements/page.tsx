"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Megaphone, Trash2, Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/admin/announcements");
      setAnnouncements(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Title and message are required");
    
    setSubmitting(true);
    try {
      await api.post("/admin/announcements", { title, message });
      toast.success("Announcement created successfully");
      setTitle("");
      setMessage("");
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-8">
      <Toaster />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Announcements</h1>
        <p className="mt-2 text-slate-500">Post updates and notices for all students.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Megaphone className="h-5 w-5 text-indigo-600" />
              New Announcement
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Mid-Term Syllabus Updated"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 min-h-[120px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the details here..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Posting..." : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Post Announcement
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-slate-500">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <Megaphone className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-slate-500">No announcements posted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-start justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{announcement.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3">
                      Posted on {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{announcement.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(announcement._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
