import { dashV2 } from "@/components/dashV2";
import type { SimuladoComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { RelatorioDoSimuladoConteudo } from "@/pages/relatorioSimulado/RelatorioDoSimuladoConteudo";
import { buscarSimuladosComCartao } from "@/services/relatorioSimulado/buscarSimuladosComCartao";
import { useCallback, useEffect, useState } from "react";

export const TEXTO_VAZIO = "Nenhum estudante desta turma enviou cartão";
export const TEXTO_VAZIO_DICA =
  "Os simulados aparecem aqui conforme os cartões forem enviados.";
export const TEXTO_ERRO = "Não foi possível carregar os simulados";
export const TEXTO_TENTAR = "Tentar novamente";
export const ROTULO_SELETOR = "Simulado";
export const SEM_NOME = "Simulado removido";

type Estado = "idle" | "loading" | "error";

/**
 * O vazio desta aba.
 *
 * ⚠️ O texto fala de **estudantes**, não de simulados. Antes do card 19 esta
 * aba listava simulados, e "Nenhum simulado desta turma teve cartão enviado"
 * descrevia a tabela que estava ali. Agora a tela é sobre quem enviou.
 */
function VazioDaTurma() {
  return (
    <div
      data-testid="simulados-da-turma-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_VAZIO}
      </p>
      <p className={cn("text-xs", dashV2.text.secondary)}>{TEXTO_VAZIO_DICA}</p>
    </div>
  );
}

/**
 * A aba "Simulados por cartão" da tela de turma.
 *
 * ⚠️ **Mostra o RELATÓRIO da turma**, não uma lista de simulados. Antes era um
 * intermediário: uma tabela de simulados que levava, em outro clique, ao
 * relatório já recortado. O card 19 cortou o intermediário.
 *
 * ⚠️ **Nada de colunas ou filtro é duplicado aqui.** Todo o conteúdo vem do
 * `RelatorioDoSimuladoConteudo`, o mesmo que a rota
 * `/dashboard/relatorio-simulado` usa. Duas cópias divergiriam na primeira
 * mudança, e a mesma turma mostraria números diferentes em duas telas.
 *
 * ⚠️ Esta aba depende do card `18`: o recorte por turma só é correto depois
 * que a api passou a resolvê-lo pela turma ATUAL do MySQL, em vez do `turmaId`
 * congelado na junção do Mongo.
 */
export function SimuladosDaTurma({
  turmaId,
  token,
}: {
  turmaId: string;
  token: string;
}) {
  const [simulados, setSimulados] = useState<SimuladoComCartao[]>([]);
  const [estado, setEstado] = useState<Estado>("loading");
  /** `null` até a lista chegar; depois, o simulado que o seletor mostra. */
  const [escolhido, setEscolhido] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setEstado("loading");
    buscarSimuladosComCartao(token, turmaId)
      .then((r) => {
        setSimulados(r.simulados);
        /*
          ⚠️ Abre já no mais recente. A rota devolve ordenado por último envio,
          então o primeiro é o que o coordenador quase sempre veio ver — e a
          tela abre com dado na tela, sem cobrar um clique de quem tem um
          simulado só.
        */
        setEscolhido(r.simulados[0]?.simuladoId ?? null);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  }, [token, turmaId]);

  useEffect(carregar, [carregar]);

  if (estado === "loading") {
    return (
      <p className={cn("px-4 py-10 text-center text-sm", dashV2.text.secondary)}>
        Carregando…
      </p>
    );
  }

  if (estado === "error") {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <p className={cn("text-sm", dashV2.text.primary)}>{TEXTO_ERRO}</p>
        <button
          type="button"
          onClick={carregar}
          className={cn("text-xs underline", dashV2.text.secondary)}
        >
          {TEXTO_TENTAR}
        </button>
      </div>
    );
  }

  if (simulados.length === 0 || escolhido === null) {
    return <VazioDaTurma />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/*
        ⚠️ O seletor substitui a tabela de simulados que existia aqui. As
        colunas dela ("Cartões", "Com leitura", "Último envio") não decidiam
        nada — quem abre a aba quer ver os estudantes.
      */}
      <label className="flex flex-wrap items-center gap-2 px-4 pt-3 text-sm">
        <span className={dashV2.text.secondary}>{ROTULO_SELETOR}</span>
        <select
          data-testid="seletor-de-simulado"
          value={escolhido}
          onChange={(e) => setEscolhido(e.target.value)}
          className={cn(
            "h-9 min-w-0 max-w-full rounded-md border px-2 text-sm outline-none",
            dashV2.border,
            dashV2.surface,
            dashV2.text.primary,
            dashV2.focus,
          )}
        >
          {simulados.map((s) => (
            <option key={s.simuladoId} value={s.simuladoId}>
              {/*
                ⚠️ Simulado sem nome NÃO some da lista: o documento sumiu mas os
                cartões continuam existindo, e esconder seria o oposto do que
                este relatório serve para fazer.
              */}
              {s.nome ?? SEM_NOME}
            </option>
          ))}
        </select>
      </label>

      {/*
        ⚠️ `key`: sem ela, trocar de simulado reaproveita a instância e o
        estado interno (página, busca, aba aberta) sobrevive à troca — a pessoa
        veria a página 3 de um relatório que acabou de mudar.
      */}
      <RelatorioDoSimuladoConteudo
        key={escolhido}
        simuladoId={escolhido}
        turmaId={turmaId}
        token={token}
        comPadding={false}
      />
    </div>
  );
}
