import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { AuthButton } from "~/components/auth-button";

export default async function DashboardPage() {
  const session = await auth();

  // Redirect unauthenticated users to landing page
  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Dashboard
        </h1>

        <div className="flex w-full max-w-4xl flex-col items-center gap-8">
          <div className="flex items-center gap-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session.user.image ?? "/default-avatar.png"}
              alt={session.user.name ?? "User"}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold">
                Welcome, {session.user.name}!
              </h2>
              <p className="text-gray-300">Signed in via Discord</p>
            </div>
          </div>
          <AuthButton />
        </div>
      </div>
    </main>
  );
}
