"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ClientLayout from "@/components/shared/ClientLayout";

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
  assignedClientId?: { _id?: string; name?: string } | string | null;
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

export default function ClientCampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [images, setImages] = useState<CampaignImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [c, i] = await Promise.all([
          fetch(`/api/campaigns?id=${campaignId}`),
          fetch(`/api/campaigns/images?campaignId=${campaignId}`),
        ]);
        if (c.ok) setCampaign(await c.json());
        if (i.ok) setImages(await i.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">Loading...</div>
      </ClientLayout>
    );
  }

  if (!campaign) {
    return (
      <ClientLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">Campaign not found.</div>
      </ClientLayout>
    );
  }

  const location = [campaign.city, campaign.camstate].filter(Boolean).join(", ") || "--";

  return (
    <ClientLayout>
      <main className="mx-auto max-w-7xl">

        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{campaign.title}</h1>
            {campaign.description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{campaign.description}</p>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
        </div>

        {/* Campaign info cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Type",       value: campaign.camptype  || "--" },
            { label: "Dimension",  value: campaign.dimension || "--" },
            { label: "Location",   value: location },
            { label: "Start Date", value: fmt(campaign.startDate) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{item.label}</p>
              <p className="mt-1.5 text-base font-medium text-zinc-900 dark:text-zinc-100">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Images table */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Campaign Images</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {images.length} {images.length === 1 ? "image" : "images"} uploaded for this campaign.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No images uploaded for this campaign yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    {["#", "Image", "Campaign Name", "Type", "Dimension", "Start Date", "End Date"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                  {images.map((img, idx) => (
                    <tr key={img._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-5 py-4 text-xs text-zinc-400 dark:text-zinc-600">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => setLightbox(img.url)} className="focus:outline-none">
                          <Image
                            src={img.url}
                            alt={img.title || campaign.title}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover hover:opacity-80 transition"
                          />
                        </button>
                      </td>
                      <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {img.title || campaign.title}
                      </td>
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                        {img.camptype || campaign.camptype || "--"}
                      </td>
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                        {img.dimension || campaign.dimension || "--"}
                      </td>
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
          )}
        </section>

      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox}
              alt="Preview"
              width={1000}
              height={700}
              className="max-h-[90vh] w-auto rounded-xl object-contain shadow-2xl"
            />
            <button
              className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition"
              onClick={() => setLightbox(null)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
