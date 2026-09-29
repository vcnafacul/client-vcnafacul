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
    <div className="flex flex-col items-center gap-2 bg-white rounded-2xl shadow-md px-6 py-8 min-w-[160px] flex-1">
      <div className="w-12 h-12 rounded-full bg-marine/10 flex items-center justify-center text-marine mb-1">
        {icon}
      </div>
      <span className="text-3xl font-extrabold text-marine leading-none">
        {formatted}
      </span>
      <span className="text-sm text-gray-500 text-center leading-snug">{label}</span>
    </div>
  );
}
