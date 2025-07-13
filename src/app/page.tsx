import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // Redirect unauthenticated users to login
  redirect("/login");
}
