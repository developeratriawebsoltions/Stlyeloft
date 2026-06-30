"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCircle, Megaphone, LogOut, UserCog } from "lucide-react";

const mainNav = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Admins", href: "/super-admin/admins", icon: Users },
  { label: "Clients", href: "/super-admin/clients", icon: UserCircle },
  { label: "Campaigns", href: "/super-admin/campaigns", icon: Megaphone },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setUser(data.user ?? null);
      } catch (error) {
        console.error("Failed to load current user", error);
      }
    }

    loadUser();
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  async function handleLogout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.href = "/";
  }

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">

      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-5">
        <span className="text-xl font-bold text-gray-900 text-center">
          Stlyeloft
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">
          Super Admin
        </p>

        <nav className="space-y-1">
          {mainNav.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/super-admin/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-indigo-600" : "text-gray-400"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

      </div>

      {/* User profile + logout */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-2">

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-base font-semibold text-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {user?.name ?? "Super Admin"}
            </p>
            <p className="truncate text-sm text-gray-500">
              {user?.email ?? "superadmin@stlyeloft.com"}
            </p>
          </div>
        </div>

        <Link
          href="/super-admin/profile"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <UserCog size={20} className="text-gray-400" />
          Edit Profile
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
        >
          <LogOut size={20} className="text-gray-400" />
          Logout
        </button>

      </div>
    </aside>
  );
}