"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, UserCog } from "lucide-react";

const mainNav = [
  { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "My Campaigns", href: "/client/campaigns", icon: Megaphone },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  async function handleLogout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.href = "/";
  }

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex relative">

      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-5">
        <span className="text-xl font-bold text-gray-900 text-center">Stlyeloft</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-sky-500">
          Client
        </p>

        <nav className="space-y-1">
          {mainNav.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/client/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-sky-50 text-sky-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={20} className={isActive ? "text-sky-600" : "text-gray-400"} />
                {label}
              </Link>
            );
          })}
        </nav>

      </div>

      <div className="border-t border-gray-200 px-4 py-4 space-y-2" ref={profileRef}>
        <button
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-base font-semibold text-white">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "CL"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {user?.name ?? "Client"}
            </p>
            <p className="truncate text-sm text-gray-500">
              {user?.email ?? "client@stlyeloft.com"}
            </p>
          </div>
        </button>

        {isProfileOpen && (
          <div className="absolute bottom-[4.5rem] left-2 right-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg shadow-black/5 z-50">
            <div className="mb-3 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{user?.name ?? "Client"}</p>
              <p className="text-sm text-gray-500">{user?.email ?? "client@stlyeloft.com"}</p>
            </div>
            <div className="space-y-2">
              <Link
                href="/client/profile"
                className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <UserCog size={15} className="text-gray-400" />
                Edit Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
