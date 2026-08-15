interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-sandstone-300 px-6 py-16 text-center">
      <p className="text-h4 font-display text-navy-900">{title}</p>
      {description && <p className="max-w-md text-body-sm text-ink-soft">{description}</p>}
    </div>
  );
}
