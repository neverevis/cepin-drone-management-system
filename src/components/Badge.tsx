import { cn } from "@/lib/utils";

export function Badge({
  label,
  colorClass,
}: {
  label: string;
  colorClass?: string;
}) {
  return (
    <span
      className={cn(
        "badge",
        colorClass ?? "bg-gray-100 text-gray-700 border-gray-300"
      )}
    >
      {label}
    </span>
  );
}
