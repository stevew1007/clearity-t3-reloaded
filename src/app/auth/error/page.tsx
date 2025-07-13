"use client";

import { Suspense } from "react";
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

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    const errorMessages: Record<
      string,
      { title: string; description: string }
    > = {
      Configuration: {
        title: "Server Error",
        description: "There is a problem with the server configuration.",
      },
      AccessDenied: {
        title: "Access Denied",
        description: "No user signup is allowed at this time.",
      },
      Verification: {
        title: "Verification Error",
        description: "The verification token has expired or is invalid.",
      },
      Default: {
        title: "Something went wrong",
        description:
          "Please try again or contact support if the problem persists.",
      },
    };

    const defaultMessage = errorMessages.Default!;
    if (!error || errorMessages[error]) {
      return errorMessages[error ?? ""] ?? defaultMessage;
    }

    // For unknown errors, include the error code
    return {
      title: defaultMessage.title,
      description: `${defaultMessage.description} (Error: ${error})`,
    };
  };

  const { title, description } = getErrorMessage(error);

  return (
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
  );
}

export default function AuthErrorPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <ErrorContent />
      </Suspense>
    </AuthLayout>
  );
}
