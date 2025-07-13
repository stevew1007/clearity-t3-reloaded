"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        Loading...
      </div>
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("discord")}
      className="flex items-center gap-3 rounded-lg bg-[#5865F2] px-6 py-3 font-semibold text-white transition hover:bg-[#4752C4]"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125 10.28 10.28 0 0 0 .372-.292.072.072 0 0 1 .077-.01c3.928 1.764 8.18 1.764 12.061 0a.072.072 0 0 1 .078.009c.12.098.246.191.372.293a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.311-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.311-.946 2.38-2.157 2.38z"/>
      </svg>
      Sign in with Discord
    </button>
  );
}