import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";
import SuperAdminLayout from "@/components/shared/SuperAdminLayout";
import SuperAdminAdminsTable from "@/components/shared/SuperAdminAdminsTable";
import { getUsers } from "@/actions/user.actions";

export const dynamic = "force-dynamic";

type UserRecord = {
  _id: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export default async function SuperAdminAdminsPage() {
  const users = await getUsers();
  const admins = users
    .filter((user) => user.role === "admin")
    .map((user) => ({
      ...user,
      _id: user._id ? String(user._id) : user._id,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt),
    })) as UserRecord[];

  return (
    <SuperAdminLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
                Super Admin
              </span>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                Admin Accounts
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                Review all registered admin accounts and maintain administrative users with edit and delete actions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/super-admin/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-indigo-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-indigo-600"
              >
                Back to dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>

          <SuperAdminAdminsTable initialAdmins={admins} />
        </div>
      </main>
    </SuperAdminLayout>
  );
}
