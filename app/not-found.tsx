import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <EmptyState
        title="We couldn't find that page"
        description="It may have moved, or the place you're looking for isn't in our curated Lucknow data yet."
      />
      <div className="mt-6 flex justify-center gap-4">
        <Button href="/explore" variant="primary">
          Explore Lucknow
        </Button>
        <Button href="/" variant="ghost">
          Back to home
        </Button>
      </div>
    </div>
  );
}
