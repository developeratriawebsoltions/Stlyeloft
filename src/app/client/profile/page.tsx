import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { getUserById } from "@/actions/user.actions";
import ClientLayout from "@/components/shared/ClientLayout";
import ProfileEditForm from "@/components/shared/ProfileEditForm";

export default async function ClientProfilePage() {
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

  const user = await getUserById(payload.id);
  if (!user) redirect("/login?role=client");

  return (
    <ClientLayout>
      <main className="min-h-full bg-transparent px-0 py-0">
        <ProfileEditForm
          initialName={(user.name as string) ?? ""}
          initialEmail={(user.email as string) ?? ""}
          accentColor="sky"
        />
      </main>
    </ClientLayout>
  );
}
