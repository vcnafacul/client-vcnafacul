import { Skeleton } from "@/components/ui/skeleton";

function ActionAreasSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="container mx-auto flex flex-col items-center justify-center gap-4 px-4"
    >
      <Skeleton className="h-8 w-full max-w-96" />
      <Skeleton className="h-4 w-full max-w-[500px]" />
      <div className="flex flex-wrap justify-center gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-60" />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-60 w-60" />
        ))}
      </div>
    </div>
  );
}

export default ActionAreasSkeleton;
