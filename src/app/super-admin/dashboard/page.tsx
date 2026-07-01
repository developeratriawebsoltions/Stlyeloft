import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";
import SuperAdminLayout from "@/components/shared/SuperAdminLayout";
import { getClientCount, getClients, getAdminCount } from "@/actions/user.actions";
import {
  countCampaignImages,
  getCampaignCountsByClientIds,
  getCampaignStatusCounts,
  getCampaignsCreatedThisMonth,
  getRecentCampaigns,
} from "@/actions/campaign.actions";

export const dynamic = "force-dynamic";

function formatRelativeDate(date?: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMinutes = Math.round((Date.now() - d.getTime()) / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function getAssignedClientName(assignedClientId: unknown) {
  return typeof (assignedClientId as any)?.name === "string"
    ? (assignedClientId as any).name
    : null;
}

const statClasses = {
  indigo: "rounded-2xl px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/20",
  emerald: "rounded-2xl px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/20",
  violet: "rounded-2xl px-3 py-1 text-xs font-semibold text-violet-700 bg-violet-100 dark:text-violet-200 dark:bg-violet-900/20",
  amber: "rounded-2xl px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 dark:text-amber-200 dark:bg-amber-900/20",
  teal: "rounded-2xl px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-100 dark:text-teal-200 dark:bg-teal-900/20",
} as const;

export default async function SuperAdminDashboard() {
  const [totalClientCount, clients, adminCount] = await Promise.all([
    getClientCount(),
    getClients(5),
    getAdminCount(),
  ]);
  const campaignCounts = await getCampaignCountsByClientIds(clients.map((client) => String(client._id)));
  const statusCounts = await getCampaignStatusCounts();
  const recentCampaigns = await getRecentCampaigns();
  const totalImages = await countCampaignImages();
  const campaignsThisMonth = await getCampaignsCreatedThisMonth();
  const totalCampaigns = Object.values(statusCounts).reduce((sum, value) => sum + value, 0);

  const stats = [
    { label: "Total Admins", value: String(adminCount), change: "Live count", color: "indigo" },
    { label: "Total Clients", value: String(totalClientCount), change: "Live count", color: "emerald" },
    { label: "Total Campaigns", value: String(totalCampaigns), change: "Current total", color: "violet" },
    { label: "Total Images", value: String(totalImages), change: "Uploaded images", color: "amber" },
    { label: "Campaigns This Month", value: String(campaignsThisMonth), change: "New campaigns", color: "teal" },
  ];

  const recentActivities = recentCampaigns.map((campaign) => {
    const createdAt = campaign.createdAt ? new Date(campaign.createdAt) : null;
    const updatedAt = campaign.updatedAt ? new Date(campaign.updatedAt) : createdAt;
    const action = createdAt && updatedAt && createdAt.getTime() === updatedAt.getTime() ? "created" : "updated";
    const assignedClientName = getAssignedClientName(campaign.assignedClientId);
    return {
      text: `${campaign.title} was ${action}`,
      detail: assignedClientName ? `Assigned to ${assignedClientName}` : `Status: ${campaign.status}`,
      age: formatRelativeDate(updatedAt),
    };
  });

  return (
    <SuperAdminLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mt-3 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
                Super Admin Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                Monitor admins, clients, campaigns, images and activity from one central dashboard.
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                      {stat.value}
                    </p>
                  </div>
                  <div className={statClasses[stat.color as keyof typeof statClasses]}>{stat.change}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    Campaigns Overview
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    This Month
                  </h2>
                </div>
                <button className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                  This Month
                </button>
              </div>
              <div className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-100 via-slate-100 to-white p-6 dark:from-indigo-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="rounded-3xl border border-dashed border-zinc-200 p-6 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">New campaigns created this month</p>
                  <p className="mt-6 text-5xl font-semibold text-zinc-900 dark:text-zinc-50">{campaignsThisMonth}</p>
                  <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{totalCampaigns} total campaigns in the system</p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Recent Campaigns</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Latest campaign updates across the platform.</p>
                </div>
                <Link href="/super-admin/campaigns" className=" ctext-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">
                  View All
                </Link>
              </div>
              <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
                  <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Campaign Name</th>
                      <th className="px-6 py-4 font-medium">Client Name</th>
                      <th className="px-6 py-4 font-medium">State</th>
                      <th className="px-6 py-4 font-medium">Start Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {recentCampaigns.map((campaign) => {
                      const assignedClientName = getAssignedClientName(campaign.assignedClientId);
                      return (
                        <tr key={String(campaign._id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                          <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100">{campaign.title}</td>
                          <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">{assignedClientName ?? "—"}</td>
                          <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">{campaign.camstate || campaign.city || "—"}</td>
                          <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Recent Activities</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track the latest platform actions.</p>
                </div>
                <Link href="/super-admin/admins" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={`${activity.detail}-${activity.age}-${index}`} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{activity.text}</p>
                    <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-300">{activity.detail}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{activity.age}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-1">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Recent Clients</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Latest client accounts and their campaign activity.</p>
                </div>
                <Link href="/super-admin/clients" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">
                  View All
                </Link>
              </div>
              <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
                  <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Client Number</th>
                      <th className="px-6 py-4 font-medium">Client Name</th>
                      <th className="px-6 py-4 font-medium">Total Campaigns</th>
                      <th className="px-6 py-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                          No clients found
                        </td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr key={String(client._id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                          <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{client.clientNumber || "—"}</td>
                          <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100">{client.name || "—"}</td>
                          <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">{campaignCounts[client._id] ?? 0}</td>
                          <td className="px-6 py-4">
                            <Link href={`/super-admin/clients/${client._id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">
                              View Campaigns
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </SuperAdminLayout>
  );
}
