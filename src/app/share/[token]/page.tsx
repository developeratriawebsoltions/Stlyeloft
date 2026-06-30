"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Campaign = {
  _id: string;
  title: string;
  description?: string;
  camptype?: string;
  dimension?: string;
  camstate?: string;
  city?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  assignedClientId?: { name?: string } | string | null;
};

type CampaignImage = {
  _id: string;
  url: string;
  title?: string;
  camptype?: string;
  dimension?: string;
  startDate?: string;
  endDate?: string;
};

function fmt(d?: string | null) {
  if (!d) return "--";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function clientName(v?: { name?: string } | string | null) {
  if (!v) return null;
  if (typeof v === "string") return v;
  return v.name ?? null;
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [images, setImages] = useState<CampaignImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/campaigns/share?token=${token}`);
        if (!res.ok) { setNotFound(true); return; }
        const camp: Campaign = await res.json();
        setCampaign(camp);

        const imgRes = await fetch(`/api/campaigns/images?campaignId=${camp._id}`);
        if (imgRes.ok) setImages(await imgRes.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-sky-500" />
          <p className="text-sm text-zinc-500">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 dark:bg-zinc-950">
        <div className="text-5xl">🔗</div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Link not found</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">This campaign link is invalid or has been removed.</p>
      </div>
    );
  }

  const location = [campaign.city, campaign.camstate].filter(Boolean).join(", ") || "--";
  const name = clientName(campaign.assignedClientId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Stlyeloft</span>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
            Shared Campaign
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Campaign header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{campaign.title}</h1>
          {name && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Client: {name}</p>}
          {campaign.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{campaign.description}</p>
          )}
        </div>

        {/* Info cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Type",       value: campaign.camptype  || "--" },
            { label: "Dimension",  value: campaign.dimension || "--" },
            { label: "Location",   value: location },
            { label: "Start Date", value: fmt(campaign.startDate) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{item.label}</p>
              <p className="mt-1.5 text-base font-medium text-zinc-900 dark:text-zinc-100">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Images */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Campaign Images</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {images.length} {images.length === 1 ? "image" : "images"}
            </p>
          </div>

          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No images uploaded yet.
            </div>
          ) : (
            <>
              {/* Grid view */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((img) => (
                  <button
                    key={img._id}
                    onClick={() => setLightbox(img.url)}
                    className="group relative aspect-video overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800"
                  >
                    <Image
                      src={img.url}
                      alt={img.title || campaign.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                      <p className="truncate text-xs font-medium text-white">{img.title || campaign.title}</p>
                      {(img.camptype || campaign.camptype) && (
                        <p className="text-xs text-white/70">{img.camptype || campaign.camptype}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Detail table */}
              <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
                  <thead className="bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      {["#", "Campaign Name", "Type", "Dimension", "Start Date", "End Date"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {images.map((img, idx) => (
                      <tr key={img._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="px-5 py-4 text-xs text-zinc-400">{idx + 1}</td>
                        <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">{img.title || campaign.title}</td>
                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{img.camptype || campaign.camptype || "--"}</td>
                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{img.dimension || campaign.dimension || "--"}</td>
                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                          {fmt(img.startDate) !== "--" ? fmt(img.startDate) : fmt(campaign.startDate)}
                        </td>
                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                          {fmt(img.endDate) !== "--" ? fmt(img.endDate) : fmt(campaign.endDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Stlyeloft · Campaign Management Platform
        </p>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox}
              alt="Preview"
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto rounded-xl object-contain shadow-2xl"
            />
            <button
              className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
              onClick={() => setLightbox(null)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
