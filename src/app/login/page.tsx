import { AuthLayout } from "~/components/auth-layout";
import { LoginForm } from "~/components/login-form";
import { isSignupEnabled } from "~/lib/actions";

export default async function LoginPage() {
  const signupAllowed = await isSignupEnabled();

  return (
    <AuthLayout>
      <LoginForm signupAllowed={signupAllowed} />
    </AuthLayout>
  );
}
