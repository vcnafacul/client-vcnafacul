/**
 * Card de número de impacto (antes interno da `quemSomos/ImpactoSection`).
 * Compartilhado com a página pública do cursinho (tickets/025). `null` = "—".
 */
export function ImpactCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | null;
  label: string;
}) {
  const formatted = value === null ? "—" : value.toLocaleString("pt-BR");

  return (
    <div className="flex flex-col items-center gap-2 bg-white rounded-xl shadow-md px-6 py-8 min-w-[160px] flex-1">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-foreground mb-1">
        {icon}
      </div>
      <span className="text-h1 font-extrabold text-foreground">
        {formatted}
      </span>
      <span className="text-body text-muted-foreground text-center">{label}</span>
    </div>
  );
}
