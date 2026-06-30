"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

type UserRecord = {
  _id: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string | undefined, email: string | undefined) {
  const value = name?.trim() || email?.split("@")[0] || "User";
  const parts = value.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

export default function SuperAdminAdminsTable({ initialAdmins }: { initialAdmins: UserRecord[] }) {
  const [admins, setAdmins] = useState<UserRecord[]>(initialAdmins);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const startEdit = (admin: UserRecord) => {
    setError("");
    setEditing(admin);
    setName(admin.name || "");
    setEmail(admin.email || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setName("");
    setEmail("");
    setError("");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/users?id=${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Unable to update admin");
      }

      setAdmins((current) =>
        current.map((admin) => (admin._id === editing._id ? { ...admin, ...result } : admin))
      );
      cancelEdit();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admin account?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error || "Unable to delete admin");
      }

      setAdmins((current) => current.filter((admin) => admin._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(admins.length / PAGE_SIZE);
  const paginated = admins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const renderRows = useMemo(() => {
    if (admins.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
            No admin accounts found.
          </td>
        </tr>
      );
    }

    return paginated.map((admin) => (
      <tr key={admin._id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white">
              {getInitials(admin.name, admin.email)}
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{admin.name || "—"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{admin.email || "—"}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{admin.role}</td>
        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{formatDate(admin.createdAt)}</td>
        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{formatDate(admin.updatedAt)}</td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startEdit(admin)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={deletingId === admin._id}
              onClick={() => handleDelete(admin._id)}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
            >
              {deletingId === admin._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [admins, paginated, deletingId]);

  return (
    <div>
      <section className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Admins</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Admin management</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Edit admin details, remove accounts, and keep all admin users up to date.
            </p>
          </div>
          <div className="rounded-3xl bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
            {admins.length} admin account{admins.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold">Updated</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>{renderRows}</tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Edit Admin</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Update the admin name and email address.</p>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                />
              </label>
            </div>

            {error ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
