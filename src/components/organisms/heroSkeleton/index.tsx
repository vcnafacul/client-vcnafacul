import { Skeleton } from "@/components/ui/skeleton";

// Sobre o fundo primary, o bloco pulsa em primary-foreground (R28).
const bloco = "bg-primary-foreground/15";

export function HeroSkeleton() {
  return (
    <div className="flex min-h-[750px] w-screen justify-center bg-primary sm:min-h-[480px] md:min-h-[600px]">
      <div
        role="status"
        aria-label="Carregando"
        className="container box-border flex min-h-screen flex-col justify-start px-4 pt-24 sm:min-h-[430px] sm:flex-row sm:items-start sm:justify-between sm:pt-20 md:min-h-[600px] md:self-center"
      >
        <div className="flex flex-col justify-start gap-4 sm:self-start md:mb-28 md:w-full md:self-center">
          <Skeleton className={`h-[50px] w-full max-w-[500px] ${bloco}`} />
          <Skeleton className={`h-4 w-full max-w-[700px] ${bloco}`} />
          <Skeleton className={`h-4 w-full max-w-[700px] ${bloco}`} />
          <div className="flex gap-4">
            <Skeleton className={`h-4 w-[100px] ${bloco}`} />
            <Skeleton className={`h-4 w-[100px] ${bloco}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
