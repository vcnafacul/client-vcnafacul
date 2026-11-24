import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Moldura das páginas da dash: fundo `page` e uma coluna central de até 1400px. É a mesma do
 * `DashListTemplate`, para que toda tela interna tenha a mesma largura e o mesmo respiro.
 */
export function PageShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.header))] bg-page">
      <div className={cn("mx-auto flex w-full max-w-page-wide flex-col gap-4 px-4 py-6", className)}>
        {children}
      </div>
    </div>
  );
}

export interface PageHeaderBarProps {
  title: React.ReactNode;
  /** Ex.: "3 períodos letivos". */
  subtitle?: React.ReactNode;
  backButton?: React.ReactNode;
  /** Botões à direita; a ação principal vai por último (na ponta direita). */
  actions?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

/**
 * A linha do cabeçalho: título (o h1 da página, um por página, tickets/059 §6) e subtítulo à
 * esquerda, ações à direita.
 */
export function PageHeaderBar({
  title,
  subtitle,
  backButton,
  actions,
  className,
  "data-testid": testId = "page-header-bar",
}: PageHeaderBarProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {backButton}
        <div className="min-w-0">
          {/* Quebra linha em vez de cortar: nas páginas de detalhe o subtítulo junta período,
              datas e contagens, e cortado no celular a informação sumia. */}
          <h1 className="break-words text-h3 font-semibold text-foreground">{title}</h1>
          {subtitle ? <div className="break-words text-body text-muted-foreground">{subtitle}</div> : null}
        </div>
      </div>
      {actions ? (
        <div data-testid="page-header-actions" className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export interface PageHeaderProps extends PageHeaderBarProps {
  /** Linhas extras dentro da faixa, abaixo do título (filtros, abas). */
  children?: React.ReactNode;
}

/** Cabeçalho de página da dash: faixa branca com borda, como o das listagens. */
export function PageHeader({ children, className, ...bar }: PageHeaderProps) {
  return (
    <div
      data-testid="page-header"
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card [&>:last-child]:border-b-0",
        className,
      )}
    >
      <PageHeaderBar {...bar} />
      {children}
    </div>
  );
}
