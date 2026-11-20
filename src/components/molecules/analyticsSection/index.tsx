import { ReactNode } from "react";

interface AnalyticsSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function AnalyticsSection({
  title,
  subtitle,
  children,
  actions,
}: AnalyticsSectionProps) {
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
