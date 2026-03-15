import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardColor = "marine" | "green" | "orange" | "red" | "pink";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: StatCardColor;
  icon?: ReactNode;
  loading?: boolean;
}

const borderColorMap: Record<StatCardColor, string> = {
  marine: "border-l-marine",
  green: "border-l-green2",
  orange: "border-l-orange",
  red: "border-l-red",
  pink: "border-l-pink",
};

const textColorMap: Record<StatCardColor, string> = {
  marine: "text-marine",
  green: "text-green2",
  orange: "text-orange",
  red: "text-red",
  pink: "text-pink",
};

export default function StatCard({
  label,
  value,
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
            </p>
            <p className="text-sm text-grey truncate">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}
