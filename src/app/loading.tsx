export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-zinc-200 bg-white/90 p-10 shadow-xl shadow-zinc-200/50 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-700 dark:border-t-indigo-300 animate-spin" />
        <div className="space-y-2 text-center">
          <p className="text-xl font-semibold">Loading Stlyeloft</p>
          <p className="max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
            Preparing the page and fetching your data. This should only take a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
