import { Skeleton } from "@/components/ui/skeleton";

function SupportersSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="container mx-auto my-20 flex flex-col items-center justify-center gap-4 px-4"
    >
      <Skeleton className="h-8 w-full max-w-96" />
      <Skeleton className="h-4 w-full max-w-[500px]" />
      <div className="flex flex-wrap justify-center gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-32 w-60" />
        ))}
      </div>
    </div>
  );
}

export default SupportersSkeleton;
