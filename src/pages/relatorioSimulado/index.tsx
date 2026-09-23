import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { DASH, PARTNER_CLASS, PARTNER_PROVAS } from "@/routes/path";
import { Roles } from "@/enums/roles/roles";
import { caminhoDaTurma } from "../partnerClassWithStudents/abaDaTurma";
import { useAuthStore } from "@/store/auth";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RelatorioDoSimuladoConteudo } from "./RelatorioDoSimuladoConteudo";
import type { LocationStateDoRelatorio } from "./voltar";

/**
 * A ROTA do relatório de um simulado.
 *
 * ⚠️ **Só cuida de roteamento**: lê o recorte da URL, monta o "voltar" e
 * delega o conteúdo ao `RelatorioDoSimuladoConteudo`, que a aba da turma
 * também usa. Antes do card 19 tudo isto vivia aqui, e a aba teria de copiar.
 *
 * ⚠️ **O recorte vem da URL**, não de estado interno: `:simuladoId` no caminho
 * e `?turma=` opcional. É o que deixa o link ser colado, favoritado e
 * recarregado sem perder onde a pessoa estava.
 */
function RelatorioSimulado() {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const [searchParams] = useSearchParams();
  /**
   * ⚠️ `||`, **não `??`**: `?turma=` (valor vazio) é um resultado rotineiro de
   * link mastigado, e `??` deixaria a string vazia passar. Aí os dois lados
   * discordam — o serviço testa `turmaId ? …` e pediria o cursinho INTEIRO,
   * enquanto esta tela testa `!== undefined` e esconderia a coluna Turma: o
   * recorte mais largo possível, numa página que não diz de quem ele é.
   */
  const turmaId = searchParams.get("turma") || undefined;
  const { data } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const de = (location.state as LocationStateDoRelatorio | null)?.de;

  const voltar = () => {
    // ⚠️ `replace`: sem isto o histórico vira [listagem, relatório, listagem]
    // e o "voltar" do navegador devolve a pessoa PARA o relatório.
    if (de) {
      navigate(de.caminho, { replace: true, state: { de } });
      return;
    }
    // ⚠️ E não `navigate(-1)`: num link compartilhado aberto em aba nova não
    // há histórico, e o botão fica inerte — justamente no caso que fez esta
    // tela ser rota e não modal.
    navigate(`${DASH}/${PARTNER_PROVAS}`);
  };

  /*
    ⚠️ **"Relatório do simulado" virou o `document.title`** (card 18). Ele saiu
    do `<h1>`, que agora é o nome do simulado — mas não sumiu: na aba do
    navegador e no histórico é onde ele sempre foi útil, e é o que identifica a
    aba esquecida meia hora depois.

    ⚠️ Restaura ao desmontar: sem isso a próxima tela herda o título desta.
  */
  useEffect(() => {
    const anterior = document.title;
    document.title = "Relatório do simulado";
    return () => {
      document.title = anterior;
    };
  }, []);

  /*
    ⚠️ **O link só existe com turma E com permissão** (card 17).

    Sem `turmaId` o relatório é do cursinho inteiro, e não há "a turma" cuja
    evolução ver. E a rota da turma é guardada por `visualizarTurmas` — sem ela
    a `ProtectedRoutePermission` redireciona **calada**, então o link levaria a
    pessoa para fora da tela sem dizer por quê. Mesmo critério que a aba
    "Simulados por cartão" já aplica com `gerenciarEstudantes`.
  */
  const podeVerTurma = !!data.permissao[Roles.visualizarTurmas];

  if (!simuladoId) return null;

  return (
    <RelatorioDoSimuladoConteudo
      simuladoId={simuladoId}
      turmaId={turmaId}
      token={data.token}
      comTitulo
      linkDoDesempenho={
        turmaId !== undefined && podeVerTurma
          ? {
              // ⚠️ `DASH` já começa com barra — ver `routes/path.ts`.
              href: caminhoDaTurma(
                `${DASH}/${PARTNER_CLASS}`,
                turmaId,
                "desempenho",
              ),
            }
          : undefined
      }
      cabecalho={
        <>
          {/* ⚠️ `print:hidden`: numa folha impressa não há "voltar". */}
          <button
            type="button"
            onClick={voltar}
            className={cn(
              "inline-flex w-fit items-center gap-2 text-sm print:hidden",
              dashV2.text.secondary,
              dashV2.focus,
            )}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar
          </button>

          {/*
            ⚠️ O `<h1>` saiu daqui (card 18): ele passou a ser o NOME do
            simulado, que vem do resumo — e quem carrega o resumo é o
            `RelatorioDoSimuladoConteudo`, não esta rota.

            "Relatório do simulado" não sumiu: virou o `document.title`, que é
            onde ele sempre foi útil — na aba do navegador e no histórico.
          */}
        </>
      }
    />
  );
}

export default RelatorioSimulado;
