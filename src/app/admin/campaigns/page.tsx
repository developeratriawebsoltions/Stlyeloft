"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/shared/AdminLayout";


type Campaign = {
  _id: string;
  title: string;
  location?: string;
  status: string;
  totalViews?: number;
  assignedClientId?: { _id?: string; name?: string } | string | null;
  ownerId?: { _id?: string; name?: string } | string;
  createdAt: string;
};

function resolveName(value?: { _id?: string; name?: string } | string | null) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.name || "—";
}

export default function SuperAdminCampaignsPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = new URL("/api/campaigns", window.location.origin);
        if (searchFilter) url.searchParams.set("search", searchFilter);
        if (clientId) url.searchParams.set("assignedClientId", clientId);
        const res = await fetch(url.toString());
        if (res.ok) setCampaigns(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchFilter, clientId]);

  return (
    <AdminLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Campaigns</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {clientId ? "Showing campaigns for selected client." : "All campaigns across the platform."}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/super-admin/dashboard"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <section className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <form
              onSubmit={(e) => { e.preventDefault(); setSearchFilter(search.trim()); }}
              className="flex gap-3"
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <button
                type="submit"
                className=" cursor-pointer inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Search
              </button>
            </form>
          </section>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  <th className="px-6 py-4 font-semibold">Campaign Name</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">Loading...</td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No campaigns found.</td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign._id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {resolveName(campaign.assignedClientId)}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{campaign.title}</td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{campaign.location || "—"}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/super-admin/campaigns/${campaign._id}`}
                          className=" cursor-pointer inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                        >
                          View More
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
