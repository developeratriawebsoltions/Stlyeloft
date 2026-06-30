"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isInternalLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return false;

  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const pendingNavigation = useRef(false);
  const previousLocation = useRef("");
  const showTimer = useRef<number | null>(null);

  const locationKey = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;

  useEffect(() => {
    previousLocation.current = locationKey;
  }, []);

  useEffect(() => {
    if (!pendingNavigation.current) return;
    if (locationKey !== previousLocation.current) {
      pendingNavigation.current = false;
      if (showTimer.current) {
        window.clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      setLoading(false);
      previousLocation.current = locationKey;
    }
  }, [locationKey]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalLink(anchor)) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      pendingNavigation.current = true;
      if (showTimer.current) {
        window.clearTimeout(showTimer.current);
      }
      showTimer.current = window.setTimeout(() => {
        if (pendingNavigation.current) {
          setLoading(true);
        }
      }, 120);
    };

    const handlePopState = () => {
      pendingNavigation.current = true;
      if (showTimer.current) {
        window.clearTimeout(showTimer.current);
      }
      showTimer.current = window.setTimeout(() => {
        if (pendingNavigation.current) {
          setLoading(true);
        }
      }, 120);
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
      if (showTimer.current) {
        window.clearTimeout(showTimer.current);
      }
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 px-4">
      <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-zinc-200 border-t-indigo-600 animate-spin dark:border-zinc-700 dark:border-t-indigo-300" />
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Please wait while we load the next page.</p>
        </div>
      </div>
    </div>
  );
}
