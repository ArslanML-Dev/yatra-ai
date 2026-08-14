import type { Metadata } from "next";
import { PlannerForm } from "@/components/planner/PlannerForm";

export const metadata: Metadata = {
  title: "Plan My Lucknow Trip — Yatra AI",
  description: "Tell us how you want to travel — we'll build a day-wise Lucknow itinerary.",
};

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-saffron-600">
        Plan my trip
      </p>
      <h1 className="mt-3 font-display text-4xl text-navy-900">
        Tell us how you want to travel
      </h1>
      <p className="mt-4 text-ink-soft">
        Write it in your own words, or use the form below — either way, you can adjust
        everything before we generate your plan.
      </p>
      <div className="mt-10">
        <PlannerForm />
      </div>
    </div>
  );
}
