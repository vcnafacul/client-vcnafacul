import { Button } from "@/components/ui/button";
import { controlRing } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAcimaDeSm } from "./useAcimaDeSm";
import type { DashAction, DashToolbarProps } from "./types";

/**
 * ⚠️ **A regra que segura a barra.** Da quarta secundária em diante, a ação cai
 * no `⋯` sozinha — sem quem monta a tela precisar pensar nisso. É isso que
 * impede `dashProvas` de voltar a ter seis botões lado a lado daqui a um ano.
 */
export const MAX_SECUNDARIAS_NA_BARRA = 3;

type Variante = "primary" | "secondary" | "menu";

/**
 * ⚠️ No máximo um `cta` por tela — a ação que cria o registro dali. No menu o
 * destrutivo é só texto vermelho (hover a 10%): `destructive` preenchido numa
 * linha de menu vira um bloco de largura inteira. O rótulo nunca é só a cor.
 */
function propsDoBotao(acao: DashAction, variante: Variante) {
  if (variante === "menu") {
    return {
      variant: "ghost" as const,
      className: cn(
        "w-full justify-start px-2 text-left",
        acao.destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
      ),
    };
  }
  if (acao.destructive) return { variant: "destructive" as const, className: undefined };
  return {
    variant: variante === "primary" ? ("cta" as const) : ("outline" as const),
    className: undefined,
  };
}

function Botao({ acao, variante }: { acao: DashAction; variante: Variante }) {
  const { variant, className } = propsDoBotao(acao, variante);
  const botao = (
    <Button
      type="button"
      variant={variant}
      data-action-id={acao.id}
      onClick={acao.onClick}
      disabled={acao.disabled}
      className={className}
    >
      {acao.icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {acao.icon}
        </span>
      ) : null}
      {acao.label}
    </Button>
  );

  if (!acao.disabled || !acao.disabledReason) return botao;

  /**
   * ⚠️ **O `<span>` não é enfeite.** Botão nativo desabilitado não dispara
   * evento de mouse e não recebe foco — pendurar o `Tooltip.Trigger` nele
   * garante um tooltip que nunca aparece, que é o pior dos mundos: o motivo
   * existe no código e não chega em ninguém. O gatilho é o `span`, que é
   * focável (`tabIndex=0`) e recebe hover normalmente.
   */
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span tabIndex={0} className={cn("inline-flex rounded-md", controlRing)}>
          {botao}
        </span>
      </TooltipTrigger>
      <TooltipContent>{acao.disabledReason}</TooltipContent>
    </Tooltip>
  );
}

function MenuOverflow({ acoes }: { acoes: DashAction[] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Mais ações">
          <span aria-hidden="true" className="text-h3 leading-none">
            ⋯
          </span>
        </Button>
      </PopoverTrigger>
      {/*
        ⚠️ São botões dentro de um popover, navegáveis por Tab — e nada de
        `role="menu"`/`menuitem`. O Radix Popover não implementa navegação por
        setas, e ARIA que promete o que o teclado não entrega é pior que ARIA
        nenhuma. (`@radix-ui/react-dropdown-menu` não está no projeto e não
        vamos instalar por causa de um `⋯`.)
      */}
      <PopoverContent align="end" className="w-56 p-1">
        <div className="flex flex-col gap-0.5">
          {acoes.map((acao) => (
            <Botao key={acao.id} acao={acao} variante="menu" />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Cabeçalho de listagem: título + subtítulo à esquerda, ações à direita na
 * ordem `⋯ → secundárias → primária`, com a primária na ponta direita, onde o
 * olho termina a linha.
 */
export function DashToolbar({
  title,
  subtitle,
  primary,
  secondary = [],
  overflow = [],
  backButton,
}: DashToolbarProps) {
  const acimaDeSm = useAcimaDeSm();

  // Abaixo de `sm` só a primária sobrevive na barra; o resto vai para o `⋯`.
  const naBarra = acimaDeSm ? secondary.slice(0, MAX_SECUNDARIAS_NA_BARRA) : [];
  const excedentes = acimaDeSm ? secondary.slice(MAX_SECUNDARIAS_NA_BARRA) : secondary;
  const noMenu = [...excedentes, ...overflow];

  return (
    <TooltipProvider delayDuration={200}>
      <div
        data-testid="dash-toolbar"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3"
      >
        <div className="flex min-w-0 items-center gap-2">
          {backButton}
          <div className="min-w-0">
            {/* O título da lista é o h1 da página (um por página, tickets/059 §6). */}
            <h1 className="truncate text-h3 font-semibold text-foreground">{title}</h1>
            {subtitle ? (
              <div className="truncate text-body text-muted-foreground">{subtitle}</div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {noMenu.length > 0 ? <MenuOverflow acoes={noMenu} /> : null}
          {naBarra.map((acao) => (
            <Botao key={acao.id} acao={acao} variante="secondary" />
          ))}
          {primary ? <Botao acao={primary} variante="primary" /> : null}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default DashToolbar;
