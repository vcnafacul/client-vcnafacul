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
      <div className="flex items-center justify-between px-4 pb-2 border-b border-lightGray">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-marine rounded" />
          <div>
            <h2 className="text-xl font-bold text-marine">{title}</h2>
            {subtitle && (
              <p className="text-sm text-grey">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
