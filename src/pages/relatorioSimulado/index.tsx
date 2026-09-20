import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { DASH, PARTNER_PROVAS } from "@/routes/path";
import { useAuthStore } from "@/store/auth";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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

  if (!simuladoId) return null;

  return (
    <RelatorioDoSimuladoConteudo
      simuladoId={simuladoId}
      turmaId={turmaId}
      token={data.token}
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

          <h1 className={cn("text-xl font-semibold", dashV2.text.primary)}>
            Relatório do simulado
          </h1>
        </>
      }
    />
  );
}

export default RelatorioSimulado;
