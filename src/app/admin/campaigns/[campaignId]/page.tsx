"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import AdminLayout from "@/components/shared/AdminLayout";

type Campaign = {
  _id: string;
  title: string;
  camptype?: string;
  dimension?: string;
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

function resolveName(v?: { name?: string } | string | null) {
  if (!v) return "—";
  if (typeof v === "string") return v;
  return v.name || "—";
}

function fmt(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

function toInputDate(d?: string | null) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

const TYPE_OPTIONS = ["Lit", "Non Lit"];
const DIM_OPTIONS = ["5X10", "10X20"];

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [images, setImages] = useState<CampaignImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: "", camptype: "", dimension: "", startDate: "", endDate: "" });

  const [editImg, setEditImg] = useState<CampaignImage | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", camptype: "", startDate: "", endDate: "", dimension: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [pendingEditImg, setPendingEditImg] = useState<CampaignImage | null>(null);

  // Create link state
  const [shareLink, setShareLink] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !campaignId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("campaignId", campaignId as string);
      fd.append("title", uploadForm.title || campaign?.title || "");
      fd.append("camptype", uploadForm.camptype);
      fd.append("dimension", uploadForm.dimension);
      fd.append("startDate", uploadForm.startDate);
      fd.append("endDate", uploadForm.endDate);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (res.ok) {
        const newImg = await res.json();
        setImages((prev) => [newImg, ...prev]);
        setShowUpload(false);
        setSelectedFile(null);
        setPreview(null);
        setUploadForm({ title: "", camptype: "", dimension: "", startDate: "", endDate: "" });
      }
    } finally {
      setUploading(false);
    }
  }

  function openEdit(img: CampaignImage) {
    setPendingEditImg(img);
    setPasswordInput("");
    setPasswordError("");
    setShowPasswordModal(true);
  }

  async function handleVerifyPassword(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setPasswordError("");
    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        setShowPasswordModal(false);
        setPasswordInput("");
        const img = pendingEditImg!;
        setEditImg(img);
        setEditForm({
          title: img.title || campaign?.title || "",
          camptype: img.camptype || campaign?.camptype || "",
          startDate: toInputDate(img.startDate) || toInputDate(campaign?.startDate),
          endDate: toInputDate(img.endDate) || toInputDate(campaign?.endDate),
          dimension: img.dimension || campaign?.dimension || "",
        });
        setEditFile(null);
        setEditPreview(null);
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Incorrect password");
      }
    } finally {
      setVerifying(false);
    }
  }

  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setEditFile(file);
    setEditPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editImg) return;
    setSaving(true);
    try {
      const fd = new FormData();
      if (editFile) fd.append("file", editFile);
      fd.append("title", editForm.title);
      fd.append("camptype", editForm.camptype);
      fd.append("dimension", editForm.dimension);
      fd.append("startDate", editForm.startDate);
      fd.append("endDate", editForm.endDate);
      const res = await fetch(`/api/uploads/${editImg._id}`, { method: "PATCH", body: fd });
      if (res.ok) {
        const updated = await res.json();
        setImages((prev) => prev.map((img) => (img._id === updated._id ? updated : img)));
        setEditImg(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editImg) return;
    const imgId = editImg._id;
    setDeleting(true);
    try {
      const res = await fetch(`/api/uploads/${imgId}`, { method: "DELETE" });
      if (res.ok) {
        setEditImg(null);
        setShowDeleteConfirm(false);
        setDeleteInput("");
        setImages((prev) => prev.filter((img) => img._id !== imgId));
      } else {
        alert("Delete failed. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleCreateLink() {
    setLinkLoading(true);
    setLinkCopied(false);
    try {
      const res = await fetch("/api/campaigns/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      if (res.ok) {
        const { shareToken } = await res.json();
        const url = `${window.location.origin}/share/${shareToken}`;
        setShareLink(url);
        setShowLinkModal(true);
      }
    } finally {
      setLinkLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">Loading...</div>
      </AdminLayout>
    );
  }

  if (!campaign) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">Campaign not found.</div>
      </AdminLayout>
    );
  }

  const inputCls = "rounded-lg border border-zinc-200 px-3 py-2 text-base outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 w-full";

  const totalPages = Math.ceil(images.length / PAGE_SIZE);
  const paginatedImages = images.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <AdminLayout>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Campaign Details for {resolveName(campaign.assignedClientId)} — {campaign.title}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleCreateLink}
              disabled={linkLoading}
              className="cursor-pointer rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              {linkLoading ? "Generating..." : "Create Link"}
            </button>
            <button onClick={() => router.back()} className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              ← Back
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="min-w-full border-separate border-spacing-0 text-base">
            <thead>
              <tr className="bg-emerald-600 text-white">
                {[
                  "Campaign Name",
                  "Start Date",
                  "End Date",
                  "Type",
                  "Image",
                  "Dimension",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-base">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {images.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-base text-zinc-500">No images found for this campaign.</td>
                </tr>
              ) : (
                paginatedImages.map((img, i) => (
                  <tr key={img._id} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-950"}>
                    <td className="px-5 py-4 font-medium text-base text-zinc-800 dark:text-zinc-200">{img.title || campaign.title}</td>
                    <td className="px-5 py-4 text-base text-zinc-600 dark:text-zinc-400">{fmt(img.startDate) !== "—" ? fmt(img.startDate) : fmt(campaign.startDate)}</td>
                    <td className="px-5 py-4 text-base text-zinc-600 dark:text-zinc-400">{fmt(img.endDate) !== "—" ? fmt(img.endDate) : fmt(campaign.endDate)}</td>
                    <td className="px-5 py-4 text-base text-zinc-600 dark:text-zinc-400">{img.camptype || campaign.camptype || "—"}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setLightbox(img.url)}>
                        <Image src={img.url} alt={campaign.title} width={72} height={72} className="rounded object-cover hover:opacity-80" />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-base text-zinc-600 dark:text-zinc-400">{img.dimension || campaign.dimension || "—"}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => openEdit(img)} className=" cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-base font-semibold text-white hover:bg-emerald-700">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-6 py-3 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, images.length)} of {images.length} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400"
              >
                ‹
              </button>
              {pageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-zinc-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                      page === p
                        ? "bg-emerald-600 text-white"
                        : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400"
              >
                ›
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => {
              setUploadForm({ title: campaign.title, camptype: campaign.camptype || "", dimension: campaign.dimension || "", startDate: toInputDate(campaign.startDate), endDate: toInputDate(campaign.endDate) });
              setShowUpload(true);
            }}
            className=" cursor-pointer rounded-lg bg-zinc-600 px-5 py-2 text-base font-semibold text-white hover:bg-zinc-700"
          >
            Add More Entries
          </button>
        </div>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Verify Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setPasswordInput(""); setPasswordError(""); }} className=" cursor-pointer text-zinc-400 hover:text-zinc-700">✕</button>
            </div>
            <p className="mb-3 text-base text-zinc-500 dark:text-zinc-400">Enter your password to edit this entry.</p>
            <form onSubmit={handleVerifyPassword} className="flex flex-col gap-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
                placeholder="Enter password"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-base outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                autoFocus
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              <button type="submit" disabled={!passwordInput || verifying} className=" cursor-pointer rounded-lg bg-emerald-600 py-2.5 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {verifying ? "Verifying..." : "Confirm"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Add Campaign Image</h3>
              <button onClick={() => { setShowUpload(false); setPreview(null); setSelectedFile(null); }} className=" cursor-pointer text-zinc-400 hover:text-zinc-700">✕</button>
            </div>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 py-6 hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950">
                {preview ? (
                  <Image src={preview} alt="preview" width={160} height={120} className="rounded-lg object-cover" />
                ) : (
                  <>
                    <span className="text-3xl">🖼️</span>
                    <span className="mt-2 text-base text-zinc-500">Click to select image</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <label className="text-sm font-medium text-zinc-500">Campaign Name</label>
              <input value={uploadForm.title} onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />

              <label className="text-sm font-medium text-zinc-500">Type</label>
              <select value={uploadForm.camptype} onChange={(e) => setUploadForm((p) => ({ ...p, camptype: e.target.value }))} className={inputCls}>
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <label className="text-sm font-medium text-zinc-500">Dimension</label>
              <select value={uploadForm.dimension} onChange={(e) => setUploadForm((p) => ({ ...p, dimension: e.target.value }))} className={inputCls}>
                <option value="">Select Dimension</option>
                {DIM_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-zinc-500">Start Date</label>
                  <input type="date" value={uploadForm.startDate} onChange={(e) => setUploadForm((p) => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-zinc-500">End Date</label>
                  <input type="date" value={uploadForm.endDate} onChange={(e) => setUploadForm((p) => ({ ...p, endDate: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <button type="submit" disabled={!selectedFile || uploading} className="mt-2 rounded-lg bg-emerald-600 py-2.5 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </form>
          </div>
        </div>
      )}

      {editImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Edit Campaign Entry</h3>
              <button onClick={() => setEditImg(null)} className="text-zinc-400 hover:text-zinc-700">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 py-4 hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950">
                <Image src={editPreview ?? editImg.url} alt="current" width={160} height={120} className="rounded-lg object-cover" />
                <span className="mt-2 text-sm text-zinc-400">Click to replace image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleEditFileChange} />
              </label>

              <label className="text-xs font-medium text-zinc-500">Campaign Name</label>
              <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />

              <label className="text-xs font-medium text-zinc-500">Type</label>
              <select value={editForm.camptype} onChange={(e) => setEditForm((p) => ({ ...p, camptype: e.target.value }))} className={inputCls}>
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500">Start Date</label>
                  <input type="date" value={editForm.startDate} onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500">End Date</label>
                  <input type="date" value={editForm.endDate} onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <label className="text-xs font-medium text-zinc-500">Dimension</label>
              <select value={editForm.dimension} onChange={(e) => setEditForm((p) => ({ ...p, dimension: e.target.value }))} className={inputCls}>
                <option value="">Select Dimension</option>
                {DIM_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <button type="submit" disabled={saving} className="mt-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => { setShowDeleteConfirm(true); setDeleteInput(""); }} className="rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600">
                {deleting ? "Deleting..." : "Delete Image"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Confirm Delete</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Type <span className="font-semibold text-red-500">delete</span> to confirm.
            </p>
            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type delete"
              className="mt-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteInput !== "delete" || deleting}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setLightbox(null)}>
          <div className="relative">
            <Image src={lightbox} alt="Preview" width={1000} height={700} className="max-h-[90vh] w-auto rounded-xl object-contain" />
            <button className="absolute right-3 top-3 rounded-full bg-white/20 p-2 text-white hover:bg-white/40" onClick={() => setLightbox(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Create Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Shareable Link</h3>
              <button onClick={() => setShowLinkModal(false)} className="cursor-pointer text-zinc-400 hover:text-zinc-700">✕</button>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950">
              <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">{shareLink}</span>
              <button
                onClick={copyLink}
                className="cursor-pointer shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition"
              >
                {linkCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
              >
                Open Link
              </a>
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
