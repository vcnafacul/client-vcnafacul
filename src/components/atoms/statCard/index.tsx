import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardColor = "marine" | "green" | "orange" | "red" | "pink";

interface StatCardProps {
  label: string;
  value: string | number;
  /** Exibido entre parênteses, esmaecido, logo após o valor. */
  secondaryValue?: string | number;
  color?: StatCardColor;
  icon?: ReactNode;
  loading?: boolean;
}

const borderColorMap: Record<StatCardColor, string> = {
  marine: "border-l-primary",
  green: "border-l-success",
  orange: "border-l-cta",
  red: "border-l-destructive",
  pink: "border-l-muted-foreground",
};

const textColorMap: Record<StatCardColor, string> = {
  marine: "text-foreground",
  green: "text-success",
  orange: "text-warning",
  red: "text-destructive",
  pink: "text-foreground",
};

const secondaryTextColorMap: Record<StatCardColor, string> = {
  marine: "text-foreground/40",
  green: "text-success/40",
  orange: "text-warning/40",
  red: "text-destructive/40",
  pink: "text-foreground/40",
};

export default function StatCard({
  label,
  value,
  secondaryValue,
  color = "marine",
  icon,
  loading = false,
}: StatCardProps) {
  return (
    <div
      className={`shadow-md bg-white rounded-lg p-4 border-l-4 ${borderColorMap[color]} flex items-center gap-3`}
    >
      {icon && (
        <div className={`${textColorMap[color]} text-2xl shrink-0`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        {loading ? (
          <>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <p className={`text-2xl font-bold ${textColorMap[color]}`}>
              {value}
              {secondaryValue !== undefined && (
                <span className={`ml-1 ${secondaryTextColorMap[color]}`}>
                  ({secondaryValue})
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground truncate">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}
