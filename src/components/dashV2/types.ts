/**
 * Contratos dos primitivos da Dash V2.
 *
 * ⚠️ A ação é classificada por **papel**, não por cor. Quem monta a tela diz
 * "isto é a ação primária" / "isto é secundária" / "isto vai no ⋯"; a aparência
 * é decisão do componente, com as regras do ticket `02`. É o que impede a
 * barra de voltar a ter seis botões de quatro cores, como em `dashProvas`.
 */
export interface DashAction {
  /** Identidade estável — usada como `key` e nos testes. */
  id: string;
  label: string;
  onClick: () => void;
  /**
   * ⚠️ Opcional **de propósito, e hoje ninguém passa**: a hierarquia desta barra
   * é por cor e posição. Ícone acrescentaria uma decisão por botão sem resolver
   * o problema que o épico ataca. O campo existe para o dia em que uma tela
   * precise — e aí é uma decisão consciente, não o default.
   */
  icon?: React.ReactNode;
  disabled?: boolean;
  /**
   * Vira tooltip no botão desabilitado — ex.: "Requer permissão: cadastrar provas".
   * Hoje o V1 deixa o botão com `opacity-30` e nada explica o motivo.
   */
  disabledReason?: string;
  destructive?: boolean;
}

export interface DashToolbarProps {
  title: string;
  /** Ex.: "128 provas". */
  subtitle?: React.ReactNode;
  /** ⚠️ No máximo UMA — o tipo torna impossível passar duas. */
  primary?: DashAction;
  /** Viram botões, na ordem. Acima de 3, as excedentes caem no `⋯` sozinhas. */
  secondary?: DashAction[];
  /** Já nascem dentro do menu `⋯`. */
  overflow?: DashAction[];
  backButton?: React.ReactNode;
}

export interface DashFilterBarProps {
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  /** Selects, checkboxes, o que a tela precisar. */
  children?: React.ReactNode;
  /** Nº de filtros ativos. Sem isso, "Limpar filtros" não aparece. */
  activeCount?: number;
  onClear?: () => void;
}
