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
import { dashV2 } from "./tokens";
import { useAcimaDeSm } from "./useAcimaDeSm";
import type { DashAction, DashToolbarProps } from "./types";

/**
 * ⚠️ **A regra que segura a barra.** Da quarta secundária em diante, a ação cai
 * no `⋯` sozinha — sem quem monta a tela precisar pensar nisso. É isso que
 * impede `dashProvas` de voltar a ter seis botões lado a lado daqui a um ano.
 */
export const MAX_SECUNDARIAS_NA_BARRA = 3;

const BASE_BOTAO =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

type Variante = "primary" | "secondary" | "menu";

function corDaAcao(acao: DashAction, variante: Variante): string {
  if (variante === "menu") {
    // ⚠️ Papéis próprios, e não `action.destructive`: vermelho preenchido numa
    // linha de menu vira um bloco de largura inteira. Ver o comentário dos dois
    // no `tokens.ts`.
    return acao.destructive ? dashV2.action.destructiveGhost : dashV2.action.menuItem;
  }
  if (acao.destructive) return dashV2.action.destructive;
  return variante === "primary" ? dashV2.action.primary : dashV2.action.secondary;
}

function Botao({ acao, variante }: { acao: DashAction; variante: Variante }) {
  const botao = (
    <button
      type="button"
      data-action-id={acao.id}
      onClick={acao.onClick}
      disabled={acao.disabled}
      className={cn(
        BASE_BOTAO,
        variante === "menu" && "h-9 w-full justify-start px-2 text-left",
        dashV2.focus,
        corDaAcao(acao, variante),
      )}
    >
      {acao.icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {acao.icon}
        </span>
      ) : null}
      {acao.label}
    </button>
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
        <span tabIndex={0} className={cn("inline-flex rounded-md", dashV2.focus)}>
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
        <button
          type="button"
          aria-label="Mais ações"
          className={cn(
            BASE_BOTAO,
            "w-9 px-0 text-lg leading-none",
            dashV2.focus,
            dashV2.action.secondary,
          )}
        >
          <span aria-hidden="true">⋯</span>
        </button>
      </PopoverTrigger>
      {/*
        ⚠️ São botões dentro de um popover, navegáveis por Tab — e nada de
        `role="menu"`/`menuitem`. O Radix Popover não implementa navegação por
        setas, e ARIA que promete o que o teclado não entrega é pior que ARIA
        nenhuma. (`@radix-ui/react-dropdown-menu` não está no projeto e não
        vamos instalar por causa de um `⋯`.)
      */}
      <PopoverContent align="end" className={cn("w-56 p-1", dashV2.surface, dashV2.border)}>
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
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3",
          dashV2.surface,
          dashV2.border,
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {backButton}
          <div className="min-w-0">
            <h2 className={cn("truncate text-lg font-semibold", dashV2.text.primary)}>
              {title}
            </h2>
            {subtitle ? (
              <div className={cn("truncate text-sm", dashV2.text.secondary)}>{subtitle}</div>
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
