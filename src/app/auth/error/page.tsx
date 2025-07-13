"use client";

import { useSearchParams } from "next/navigation";
import { AuthLayout } from "~/components/auth-layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    const errorMessages: Record<string, { title: string; description: string }> = {
      Configuration: {
        title: "Server Error",
        description: "There is a problem with the server configuration.",
      },
      AccessDenied: {
        title: "Access Denied",
        description: "Sign up is currently disabled. Only existing users can sign in.",
      },
      Verification: {
        title: "Verification Error",
        description: "The verification token has expired or is invalid.",
      },
      Default: {
        title: "Authentication Error",
        description: "An error occurred during authentication. Please try again.",
      },
    };

    return errorMessages[error ?? ""] ?? errorMessages.Default!;
  };

  const { title, description } = getErrorMessage(error);

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}