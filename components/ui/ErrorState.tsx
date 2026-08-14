interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-2xl border border-saffron-600/30 bg-saffron-600/5 px-6 py-16 text-center"
    >
      <p className="font-display text-lg text-navy-900">{title}</p>
      <p className="max-w-md text-sm text-ink-soft">{description}</p>
    </div>
  );
}
