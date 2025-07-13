import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-600 to-cyan-500 p-6 md:p-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-500/20"></div>
      <div className="absolute top-10 left-10 h-72 w-72 animate-bounce rounded-full bg-blue-400/10 blur-3xl"></div>
      <div className="absolute right-10 bottom-10 h-96 w-96 animate-pulse rounded-full bg-cyan-400/10 blur-3xl"></div>

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center text-4xl font-extrabold tracking-tight text-white">
          <span>
            Clear<span className="text-cyan-300">i</span>ty
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
