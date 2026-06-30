import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { getCampaigns } from "@/actions/campaign.actions";
import ClientLayout from "@/components/shared/ClientLayout";

function formatDate(date?: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

const statusColors: Record<string, string> = {
  active:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  draft:     "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  completed: "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
  paused:    "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
};

export default async function ClientCampaignsPage() {
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

  return (
    <ClientLayout>
      <main className="min-h-full bg-transparent">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10">
            <h1 className="mt-3 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">My Campaigns</h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              All campaigns assigned to your account.
            </p>
          </div>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {campaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No campaigns have been assigned to your account yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
                  <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Campaign Name</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Start Date</th>
                      <th className="px-6 py-4 font-medium">End Date</th>
                      <th className="px-6 py-4 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {campaigns.map((campaign) => (
                      <tr key={String(campaign._id)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{campaign.title}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[campaign.status] ?? statusColors.draft}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">{campaign.camptype || "—"}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">{formatDate(campaign.startDate)}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">{formatDate(campaign.endDate)}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-300">
                          {[campaign.city, campaign.camstate].filter(Boolean).join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
    </ClientLayout>
  );
}
