export function ChartTooltip({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[240px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-marine">{title}</p>
      {caption && <p className="text-slate-400">{caption}</p>}
      <p className="mt-1 text-slate-600">{children}</p>
    </div>
  );
}
