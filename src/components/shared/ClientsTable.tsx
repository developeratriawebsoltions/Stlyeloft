"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 8;

type ClientRecord = {
  _id: string;
  name?: string;
  email?: string;
  clientNumber?: string;
  createdAt?: string;
};

interface ClientsTableProps {
  clients: ClientRecord[];
  campaignCounts: Record<string, number>;
  // Base path for details links. The table will append `?assignedClientId={id}`.
  // Example: "/admin/campaigns" -> becomes "/admin/campaigns?assignedClientId=..."
  detailsPathBase?: string;
  // Base path for client detail pages. Example: "/admin/clients" -> becomes "/admin/clients/{id}"
  clientDetailsBase?: string;
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
];

function avatarColor(idx: number) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClientsTable({ clients, campaignCounts, detailsPathBase, clientDetailsBase }: ClientsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.clientNumber?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goTo(p: number) {
    if (p >= 1 && p <= totalPages) setPage(p);
  }

  // Build page numbers with ellipsis
  function pageNumbers() {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Table header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
          <p className="mt-1 text-base text-gray-500">Showing {filtered.length} client account{filtered.length === 1 ? "" : "s"}.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-base text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50">
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full text-left text-base">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-700">Client Name</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Email Address</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Total Campaigns</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-base text-gray-400">
                  No client accounts found.
                </td>
              </tr>
            ) : (
              paginated.map((client, idx) => {
                const globalIdx = (page - 1) * PAGE_SIZE + idx;
                const initials = getInitials(client.name);
                const color = avatarColor(globalIdx);
                const href = clientDetailsBase
                  ? `${clientDetailsBase}/${client._id}`
                  : `/super-admin/clients/${client._id}`;
                return (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}>
                          {initials}
                        </div>
                        <span className="font-medium text-gray-900 text-base">{client.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-500">{client.email || "—"}</td>
                    <td className="px-6 py-4 text-base text-gray-700">{campaignCounts[client._id] ?? 0}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <p className="text-base text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} clients
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                    page === p
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
