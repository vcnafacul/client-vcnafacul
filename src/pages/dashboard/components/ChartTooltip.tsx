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
    <div className="max-w-[240px] rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{title}</p>
      {caption && <p className="text-muted-foreground">{caption}</p>}
      <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
  );
}
