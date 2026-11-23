import { Skeleton } from "@/components/ui/skeleton";

function AboutUsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="container mx-auto my-20 flex flex-col items-center gap-4 px-4 md:flex-row md:justify-center"
    >
      <Skeleton className="h-60 w-full max-w-96" />
      <div className="flex w-full max-w-96 flex-col gap-4 md:px-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export default AboutUsSkeleton;
