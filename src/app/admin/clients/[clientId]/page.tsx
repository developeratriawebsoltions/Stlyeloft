"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/shared/AdminLayout";

type Client = {
  _id: string;
  name?: string;
  email?: string;
  clientNumber?: string;
};

type Campaign = {
  _id: string;
  title: string;
  location?: string;
  status: string;
  createdAt: string;
};

const STATE_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kurnool"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Laxmi Nagar"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
};

const STATES = Object.keys(STATE_CITIES).sort();
const DIMENSIONS = ["5x10", "10x20"];

const EMPTY_FORM = {
  name: "", email: "", title: "", dimension: "",
  camstate: "", city: "", location: "", startDate: "", endDate: "",
};

export default function ClientDetailsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [userRes, campRes] = await Promise.all([
        fetch(`/api/users?id=${clientId}`),
        fetch(`/api/campaigns?assignedClientId=${clientId}`),
      ]);
      if (userRes.ok) {
        const u = await userRes.json();
        setClient(u);
        setForm((p) => ({ ...p, name: u.name || "", email: u.email || "" }));
      }
      if (campRes.ok) setCampaigns(await campRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [clientId]);

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "camstate") {
      setForm((p) => ({ ...p, camstate: value, city: "" }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          dimension: form.dimension,
          camstate: form.camstate,
          city: form.city,
          location: form.location,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          assignedClientId: clientId,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create campaign.");
      }
      setFormSuccess("Campaign created successfully!");
      setForm((p) => ({ ...EMPTY_FORM, name: p.name, email: p.email }));
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function openModal() {
    setForm((p) => ({ ...EMPTY_FORM, name: client?.name || "", email: client?.email || "" }));
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
    setFormSuccess("");
  }

  const cities = form.camstate ? STATE_CITIES[form.camstate] ?? [] : [];

  const selectCls = "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
  const inputCls = selectCls;
  const labelCls = "mb-1.5 block text-base font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <AdminLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-2 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
                {loading ? "Loading..." : client?.name || "Client Details"}
              </h1>
              {client?.email && (
                <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">{client.email}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/clients"
                className=" cursor-pointer inline-flex items-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-base font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                Back
              </Link>
              <button
                onClick={openModal}
                className=" cursor-pointer inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-700"
              >
                + Add More Campaign
              </button>
            </div>
          </div>

          {client && !loading && (
            <section className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid gap-4 sm:grid-cols-3 text-base">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Client Number</p>
                  <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">{client.clientNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Name</p>
                  <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">{client.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Email</p>
                  <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">{client.email || "—"}</p>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Campaigns ({campaigns.length})</h2>
            </div>
            <table className="min-w-full border-separate border-spacing-0 text-left text-base">
              <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                <tr>
                  <th className="px-6 py-4 font-semibold text-base">Username</th>
                  <th className="px-6 py-4 font-semibold text-base">Campaign Name</th>
                  <th className="px-6 py-4 font-semibold text-base">Location</th>
                  <th className="px-6 py-4 font-semibold text-base">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-base text-zinc-500">Loading...</td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-base text-zinc-500">No campaigns found.</td></tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign._id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                      <td className="px-6 py-4 font-medium text-base text-zinc-900 dark:text-zinc-100">{client?.name || "—"}</td>
                      <td className="px-6 py-4 font-medium text-base text-zinc-900 dark:text-zinc-100">{campaign.title}</td>
                      <td className="px-6 py-4 text-base text-zinc-500 dark:text-zinc-400">{campaign.location || "—"}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/campaigns/${campaign._id}`}
                          className=" cursor-pointer inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                        >
                          View More
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Add New Campaign</h2>
              <button onClick={closeModal} className=" cursor-pointer rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-6 lg:grid-cols-2">

              <label className="block">
                <span className={labelCls}>Name</span>
                <input name="name" value={form.name} readOnly className={`${inputCls} cursor-not-allowed opacity-70`} />
              </label>

              <label className="block">
                <span className={labelCls}>Email</span>
                <input name="email" value={form.email} readOnly className={`${inputCls} cursor-not-allowed opacity-70`} />
              </label>

              <label className="block lg:col-span-2">
                <span className={labelCls}>Campaign Name *</span>
                <input name="title" value={form.title} onChange={handleField} required placeholder="Enter campaign name" className={inputCls} />
              </label>

              <label className="block">
                <span className={labelCls}>Dimension *</span>
                <select name="dimension" value={form.dimension} onChange={handleField} required className={selectCls}>
                  <option value="">Select dimension</option>
                  {DIMENSIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>State *</span>
                <select name="camstate" value={form.camstate} onChange={handleField} required className={selectCls}>
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>City *</span>
                <select name="city" value={form.city} onChange={handleField} required disabled={!form.camstate} className={`${selectCls} disabled:opacity-50`}>
                  <option value="">{form.camstate ? "Select city" : "Select state first"}</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>Location</span>
                <input name="location" value={form.location} onChange={handleField} placeholder="e.g. MG Road, Sector 5" className={inputCls} />
              </label>

              <label className="block">
                <span className={labelCls}>Start Date</span>
                <input type="date" name="startDate" value={form.startDate} onChange={handleField} className={inputCls} />
              </label>

              <label className="block">
                <span className={labelCls}>End Date</span>
                <input type="date" name="endDate" value={form.endDate} onChange={handleField} className={inputCls} />
              </label>

              {formError && (
                <p className="lg:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-base text-red-600 dark:bg-red-950/40 dark:text-red-400">{formError}</p>
              )}
              {formSuccess && (
                <p className="lg:col-span-2 rounded-2xl bg-emerald-50 px-4 py-3 text-base text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">{formSuccess}</p>
              )}

              <div className="lg:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="cursor-pointer inline-flex items-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-base font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">Cancel</button>
                <button type="submit" disabled={submitting} className=" cursor-pointer inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">{submitting ? "Creating..." : "Create Campaign"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
