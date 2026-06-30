import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";
import AdminLayout from "@/components/shared/AdminLayout";
import ClientsTable from "@/components/shared/ClientsTable";
import { getUsers } from "@/actions/user.actions";
import { getCampaignCountsByClientIds } from "@/actions/campaign.actions";

export const dynamic = "force-dynamic";

type UserRecord = {
  _id: string;
  name?: string;
  role?: string;
  email?: string;
  clientNumber?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default async function AdminClientsPage() {
  const users = await getUsers();
  const clientsRaw = users.filter((user) => user.role === "client");
  const campaignCounts = await getCampaignCountsByClientIds(clientsRaw.map((client: any) => String(client._id)));

  // Convert Mongo objects (ObjectId, Date) to plain serializable values for Client components
  const clients = clientsRaw.map((c: any) => ({
    _id: String(c._id),
    name: c.name,
    role: c.role,
    email: c.email,
    clientNumber: c.clientNumber,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
  })) as UserRecord[];

  return (
    <AdminLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-2 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">Client Accounts</h1>
              <p className="mt-2 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">Review all registered client accounts and their campaign activity.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-base font-semibold text-zinc-900 transition hover:border-emerald-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-600"
              >
                Back to dashboard
              </Link>
              <Link
                href="/admin/add-client"
                className=" cursor-pointer inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-700"
              >
                Add Client
              </Link>
              <LogoutButton />
            </div>
          </div>

          <section className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Clients</h2>
                <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">Showing {clients.length} client account{clients.length === 1 ? "" : "s"}.</p>
              </div>
            </div>
          </section>

          <ClientsTable
            clients={clients}
            campaignCounts={campaignCounts}
            detailsPathBase="/admin/campaigns"
            clientDetailsBase="/admin/clients"
          />
        </div>
      </main>
    </AdminLayout>
  );
}
