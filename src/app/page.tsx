import Link from "next/link";
import Header from "@/components/shared/Header";

const roles = [
  {
    role: "Super Admin",
    tag: "Full Control",
    tagColor: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    accent: "from-violet-600 to-indigo-600",
    border: "hover:border-violet-400 dark:hover:border-violet-500",
    shadow: "hover:shadow-violet-100 dark:hover:shadow-violet-900/30",
    btn: "bg-violet-600 hover:bg-violet-700 focus:ring-violet-500",
    href: "/login?role=super-admin",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    perks: ["Manage admin accounts", "View all campaigns", "Monitor system analytics", "Full platform control"],
  },
  {
    role: "Admin",
    tag: "Manage",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    accent: "from-emerald-500 to-teal-500",
    border: "hover:border-emerald-400 dark:hover:border-emerald-500",
    shadow: "hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30",
    btn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    href: "/login?role=admin",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    perks: ["Create & manage clients", "Build campaigns", "Upload campaign media", "Edit & delete campaigns"],
  },
  {
    role: "Client",
    tag: "View",
    tagColor: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    accent: "from-sky-500 to-blue-500",
    border: "hover:border-sky-400 dark:hover:border-sky-500",
    shadow: "hover:shadow-sky-100 dark:hover:shadow-sky-900/30",
    btn: "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500",
    href: "/login?role=client",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    perks: ["View assigned campaigns", "Browse image gallery", "Export campaign data", "Track campaign status"],
  },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">

      {/* Background gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-200/20 blur-3xl dark:from-violet-900/20 dark:to-indigo-900/10" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-emerald-200/30 to-sky-200/20 blur-3xl dark:from-emerald-900/10 dark:to-sky-900/10" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">

        <Header />

        {/* Role Cards */}
        <div className="mt-8 mx-auto w-full max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.role}
              className={`group relative flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 ${r.border} ${r.shadow} hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900`}
            >
              {/* Top gradient bar */}
              <div className={`absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r ${r.accent}`} />

              {/* Icon */}
              <div className={`mb-4 inline-flex w-fit rounded-2xl bg-gradient-to-br ${r.accent} p-3 text-white shadow-md`}>
                {r.icon}
              </div>

              {/* Role + tag */}
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{r.role}</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.tagColor}`}>
                  {r.tag}
                </span>
              </div>

              {/* Perks */}
              <ul className="mb-8 mt-4 flex flex-col gap-2">
                {r.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <svg className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Login Button */}
              <Link
                href={r.href}
                className={`mt-auto block rounded-xl px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${r.btn}`}
              >
                Login as {r.role}
              </Link>
            </div>
          ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-14 text-center text-xs text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} · Campaign Management Platform
        </footer>
      </div>
    </main>
  );
}
