import type { ReactNode } from "react";
import SuperAdminSidebar from "@/components/shared/SuperAdminSidebar";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex h-screen max-w-full bg-zinc-50 dark:bg-zinc-950">
        <SuperAdminSidebar />
        <div className="flex-1 h-screen overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
