import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { getUserByEmail } from "@/actions/auth.actions";
import { getUserById } from "@/actions/user.actions";
import AdminLayout from "@/components/shared/AdminLayout";
import ProfileEditForm from "@/components/shared/ProfileEditForm";

export default async function AdminProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("stlyeloft_token")?.value;

  if (!token) redirect("/login?role=admin");

  let payload: { id: string; email: string; role: string };
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?role=admin");
  }

  if (payload.role !== "admin") redirect(`/${payload.role}/dashboard`);

  // Use getUserById which fetches full profile including name
  const user = await getUserById(payload.id);
  if (!user) redirect("/login?role=admin");

  return (
    <AdminLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <ProfileEditForm
          initialName={(user.name as string) ?? ""}
          initialEmail={(user.email as string) ?? ""}
          accentColor="emerald"
        />
      </main>
    </AdminLayout>
  );
}
