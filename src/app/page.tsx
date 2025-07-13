import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { AuthButton } from "~/components/auth-button";

export default async function LandingPage() {
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Clearity <span className="text-[hsl(280,100%,70%)]">EVE</span>
        </h1>
        
        <div className="flex flex-col items-center gap-6">
          <p className="text-xl text-center">
            Welcome to Clearity EVE! Sign in with Discord to manage your EVE Online characters.
          </p>
          <AuthButton />
        </div>
      </div>
    </main>
  );
}