export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 p-10 text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
