import { Skeleton } from "@/components/ui/skeleton";

function FeatureSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="container mx-auto my-10 flex flex-col items-center justify-center gap-4 px-4"
    >
      <Skeleton className="h-10 w-full max-w-96" />
      <Skeleton className="h-4 w-full max-w-96" />
      <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-center">
        <div className="flex w-full max-w-96 flex-col gap-5 py-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full max-w-96" />
      </div>
    </div>
  );
}

export default FeatureSkeleton;
