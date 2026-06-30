import React from "react";

export default function Header() {
  return (
    <div className="mb-12 text-center">
      <div className="flex items-center justify-center">
        <img src="/logo/logo.png" alt="Stlyeloft" className="h-45 sm:h-48 w-auto" />
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-zinc-500 dark:text-zinc-400">
        A production-ready campaign management platform. Select your role to sign in.
      </p>
    </div>
  );
}
