export default function UnderDevelopment() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-4 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-3 w-3 rounded-full bg-slate-900 dark:bg-slate-200"></div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              This Page Under Development
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Our website is currently being built. Check back soon.
            </p>
          </div>

          <div className="pt-2">
            <div className="relative h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="absolute left-0 top-0 h-1 w-2/3 rounded-full bg-slate-700 dark:bg-slate-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
