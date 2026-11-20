import { Combobox } from "@/components/ui/combobox";
import { useMemo } from "react";
import { CursinhoDoFiltro, filtrarCursinhos } from "./filtrar";

type Props = {
  cursinhos: CursinhoDoFiltro[];
  valor: string | null;
  onChange: (id: string | null) => void;
  carregando?: boolean;
  /** O que o "nenhum" significa na tela: "Todos os cursinhos" (padrão) ou "Meu cursinho". */
  rotuloDoVazio?: string;
  /** Nome acessível do botão. */
  rotulo?: string;
};

/** O `Combobox` não aceita valor vazio: a opção "nenhum" usa este valor por dentro. */
const NENHUM = "__nenhum__";

/**
 * Seletor de cursinho com busca (tickets/044, card 06; compartilhado no 045 —
 * Monitoramento e Indicadores). A lista de parceiros passa de algumas dezenas,
 * então é o `Combobox` do design system (tickets/059 §7.4), em ordem alfabética.
 */
export function SeletorDeCursinho({
  cursinhos,
  valor,
  onChange,
  carregando,
  rotuloDoVazio = "Todos os cursinhos",
  rotulo = "Cursinho do monitoramento",
}: Props) {
  const opcoes = useMemo(
    () => [
      { value: NENHUM, label: rotuloDoVazio },
      ...filtrarCursinhos(cursinhos, "").map((c) => ({
        value: c.id,
        label: c.name,
      })),
    ],
    [cursinhos, rotuloDoVazio],
  );

  return (
    <Combobox
      aria-label={rotulo}
      disabled={carregando}
      className="w-full sm:w-64"
      options={opcoes}
      value={valor ?? NENHUM}
      onValueChange={(v) => onChange(v === NENHUM ? null : v)}
      searchPlaceholder="Buscar cursinho"
      emptyText="Nenhum cursinho com esse nome."
    />
  );
}
