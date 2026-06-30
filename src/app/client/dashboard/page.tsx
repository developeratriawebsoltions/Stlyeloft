import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/jwt";
import { getCampaigns } from "@/actions/campaign.actions";
import LogoutButton from "@/components/ui/LogoutButton";
import ClientLayout from "@/components/shared/ClientLayout";

function formatDate(date?: Date | string | null) {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const camtypeConfig: Record<string, string> = {
  "Lit":     "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
  "Non Lit": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default async function ClientDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("stlyeloft_token")?.value;

  if (!token) redirect("/login?role=client");

  let payload: { id: string; email: string; role: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?role=client");
  }

  if (payload.role !== "client") redirect(`/${payload.role}/dashboard`);

  const campaigns = await getCampaigns({ assignedClientId: payload.id });

  const total  = campaigns.length;
  const recent = campaigns.slice(0, 5);

  return (
    <ClientLayout>
      <main className="min-h-full bg-transparent">
        <div className="mx-auto max-w-7xl">
            
          {/* Header */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mt-3 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">My Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                View your assigned campaigns and track their status.
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Stats */}
          <div className="w-fit">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Total Campaigns</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{total}</p>
                </div>
                <span className="rounded-2xl px-3 py-1 text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">All time</span>
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="mt-8">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">My Campaigns</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Campaigns assigned to your account.</p>
                </div>
                <Link
                  href="/client/campaigns"
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  View All
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  No campaigns assigned to your account yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-900">
                      <tr>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">#</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Campaign Name</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Type</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Dimension</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">City / State</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Start Date</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">End Date</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                      {recent.map((campaign, idx) => {
                        const location = [campaign.city, campaign.camstate].filter(Boolean).join(", ") || "--";
                        return (
                          <tr key={String(campaign._id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <td className="px-5 py-4 text-zinc-400 dark:text-zinc-600 text-xs">{idx + 1}</td>
                            <td className="px-5 py-4 max-w-xs">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={campaign.title}>
                                {campaign.title}
                              </div>
                              {campaign.location && (
                                <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 truncate" title={campaign.location}>
                                  {campaign.location}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {campaign.camptype ? (
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${camtypeConfig[campaign.camptype] ?? "bg-zinc-100 text-zinc-600"}`}>
                                  {campaign.camptype}
                                </span>
                              ) : (
                                <span className="text-zinc-400 dark:text-zinc-600">--</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{campaign.dimension || "--"}</td>
                            <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{location}</td>
                            <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{formatDate(campaign.startDate)}</td>
                            <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{formatDate(campaign.endDate)}</td>
                            <td className="px-5 py-4">
                              <Link
                                href={`/client/campaigns/${String(campaign._id)}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition"
                              >
                                View More
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

        </div>
      </main>
    </ClientLayout>
  );
}
