"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <ErrorState
        title="Something went wrong"
        description="This page hit an unexpected error. You can try again, or head back to the homepage."
      />
      <div className="mt-6 flex justify-center gap-4">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <Button href="/" variant="ghost">
          Back to home
        </Button>
      </div>
    </div>
  );
}
