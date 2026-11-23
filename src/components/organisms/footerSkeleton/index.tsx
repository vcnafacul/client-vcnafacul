import { Skeleton } from "@/components/ui/skeleton";

// Sobre o fundo primary, o bloco pulsa em primary-foreground (R28).
const bloco = "bg-primary-foreground/15";

function FooterSkeleton() {
  return (
    <footer className="bg-primary px-0 py-12 text-center text-body md:pb-9 md:pt-14 md:text-left">
      <div
        role="status"
        aria-label="Carregando"
        className="container mx-auto my-4 flex flex-wrap px-4"
      >
        <div className="flex w-full flex-col justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center justify-center gap-4">
              <Skeleton className={`size-10 rounded-full ${bloco}`} />
              <Skeleton className={`h-4 w-40 ${bloco}`} />
            </div>
            <Skeleton className={`h-4 w-full max-w-96 ${bloco}`} />
          </div>
          {[3, 3, 2].map((linhas, coluna) => (
            <div key={coluna} className="flex flex-col gap-4 md:my-4">
              {Array.from({ length: linhas }, (_, i) => (
                <Skeleton key={i} className={`h-4 w-60 max-w-full ${bloco}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default FooterSkeleton;
