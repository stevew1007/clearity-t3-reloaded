import { AuthLayout } from "~/components/auth-layout";
import { SignupForm } from "~/components/signup-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function SignupPage() {
  // Check if signup is enabled
  const isSignupDisabled = process.env.ENABLE_SIGNUP !== "true";

  if (isSignupDisabled) {
    return (
      <AuthLayout>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Registration Disabled</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              User registration is currently disabled.
            </p>
            <a
              href="/login"
              className="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Back to Login
            </a>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
