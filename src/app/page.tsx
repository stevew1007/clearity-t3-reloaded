import { auth } from "~/server/auth";
import { AuthButton } from "~/components/auth-button";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Clearity <span className="text-[hsl(280,100%,70%)]">EVE</span>
        </h1>
        
        {!session ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-xl text-center">
              Welcome to Clearity EVE! Sign in with Discord to manage your EVE Online characters.
            </p>
            <AuthButton />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
            <div className="flex items-center gap-4 text-center">
              <img 
                src={session.user.image || "/default-avatar.png"} 
                alt={session.user.name || "User"} 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold">Welcome, {session.user.name}!</h2>
                <p className="text-gray-300">Signed in via Discord</p>
              </div>
            </div>
            <AuthButton />
          </div>
        )}
      </div>
    </main>
  );
}
