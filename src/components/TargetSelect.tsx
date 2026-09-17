import type { TargetOption } from "@/lib/targetOptions";

export function TargetSelect({
  options,
  defaultValue,
  name = "target",
}: {
  options: TargetOption[];
  defaultValue?: string;
  name?: string;
}) {
  const groups = ["Equipamentos", "Acessórios", "Baterias"] as const;
  return (
    <select name={name} required className="input" defaultValue={defaultValue ?? ""}>
      <option value="">Selecione o item afetado...</option>
      {groups.map((g) => {
        const items = options.filter((o) => o.group === g);
        if (items.length === 0) return null;
        return (
          <optgroup key={g} label={g}>
            {items.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
