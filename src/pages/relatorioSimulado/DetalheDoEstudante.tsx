import {
  DashTable,
  dashV2,
  StatusBadge,
  type DashColumn,
} from "@/components/dashV2";
import ModalTemplate from "@/components/templates/modalTemplate";
import type {
  DetalheDoEstudante as Detalhe,
  LinhaDoRelatorio,
  MediaPorMateria,
  RespostaDoEstudante,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { buscarDetalheDoEstudante } from "@/services/relatorioSimulado/buscarDetalheDoEstudante";
import { useCallback, useEffect, useState } from "react";
import { AcaoDeReenvio } from "./AcaoDeReenvio";
import {
  formatarDificuldade,
  type DificuldadeDaQuestao,
} from "./dificuldadeDaQuestao";
import { ResumoDoEstudante } from "./ResumoDoEstudante";
import {
  ROTULO_DA_DIFICULDADE,
  type RecorteDoRelatorio,
} from "./recorteDoRelatorio";
import { rotuloDoResultado } from "./rotuloDoResultado";

const VAZIO = "—";


export const TEXTO_PROCESSANDO =
  "A leitura deste cartão ainda está processando. Volte em alguns minutos.";
export const TEXTO_FALHA_SEM_DESCRICAO = "A leitura deste cartão falhou.";
export const TEXTO_SEM_RESPOSTAS = "Nenhuma resposta neste cartão";
export const TEXTO_STATUS_DESCONHECIDO =
  "A situação deste cartão não é conhecida por esta versão da tela. Atualize a página; se continuar, fale com o suporte.";

/**
 * Os status que ESTA tela sabe exibir.
 *
 * ⚠️ **Existe pelo mesmo motivo que o `default` do `statusDaLinha`**: o ms pode
 * ganhar um status antes do client, e sem esta lista um valor novo caía na
 * tabela e a tela dizia "Nenhuma resposta neste cartão" — que AFIRMA que o
 * estudante não respondeu nada. O que se sabe é outra coisa: que não se sabe.
 * Postura igual dos dois lados da tela, e nunca "Lido" por omissão.
 */
const STATUS_CONHECIDOS: readonly string[] = [
  "completed",
  "failed",
  "awaiting_omr",
  "pending",
  "processing",
];

/**
 * ⚠️ Função, e não constante: a coluna de dificuldade depende do índice
 * carregado pela tela, e uma constante de módulo fecharia sobre o valor do
 * primeiro render.
 */
const colunasDoDetalhe = (
  dificuldade: Map<string, DificuldadeDaQuestao>,
  recorte: RecorteDoRelatorio,
): DashColumn<RespostaDoEstudante>[] => [
  {
    id: "numero",
    header: "Questão",
    width: "6rem",
    primary: true,
    // Questão sem número já vem no fim, ordenada pelo ms.
    cell: (r) => r.numero ?? VAZIO,
  },
  {
    id: "marcada",
    header: "Marcou",
    width: "6rem",
    align: "center",
    /**
     * ⚠️ Ausência vira `—`, e o rótulo do resultado ao lado diz "Sem leitura".
     * Nenhuma letra é inventada aqui: a chave não existe no documento.
     */
    cell: (r) => r.alternativaEstudante ?? VAZIO,
  },
  {
    id: "correta",
    header: "Correta",
    width: "6rem",
    align: "center",
    cell: (r) => r.alternativaCorreta ?? VAZIO,
  },
  {
    id: "resultado",
    header: "Resultado",
    width: "9rem",
    cell: (r) => {
      const { texto, tone } = rotuloDoResultado(r.resultado);
      return <StatusBadge tone={tone} label={texto} />;
    },
  },
  {
    id: "dificuldade",
    /*
      ⚠️ **O rótulo diz QUAL recorte**, e ele muda: o agregado vem do mesmo
      recorte do relatório aberto (`simuladoId` + `turmaId`), então com
      `?turma=` este percentual é o da turma e **sem ele é o do cursinho
      inteiro**.

      O rótulo era fixo em "Acertos na turma", e por isso mentia justamente no
      caminho mais comum — o `dashProvas`, que abre o relatório do cursinho sem
      turma nenhuma. Quem lê "na turma" ali conclui que está vendo um recorte
      que não pediu.

      ⚠️ **Dinâmico, e não um rótulo neutro** ("% de acerto" ou "Acertos
      gerais"): neutro resolve a mentira trocando-a por vaguidão — e o número
      NÃO é geral, é sempre de um recorte. Dizer qual é o que deixa o
      coordenador julgar a amostra, que é o mesmo motivo de a base andar junto
      logo abaixo.
    */
    header: ROTULO_DA_DIFICULDADE[recorte],
    /*
      ⚠️ 11rem cabe o maior dos dois rótulos ("Acertos no cursinho", ~145px em
      `text-sm`) depois do `px-3` e do ícone de ordenação do `<th>`. O
      `DashTable` trunca o título, e foi esse aperto que produziu o cabeçalho
      cortado consertado no card 04.
    */
    width: "11rem",
    align: "right",
    /*
      ⚠️ A base ("de 20") anda junto, sempre. Num recorte pequeno "100%" é
      verdadeiro e inútil; com a base, quem lê julga a amostra sozinho — e a
      tela não precisa esconder nada por baixo de um limiar inventado.
    */
    cell: (r) => formatarDificuldade(dificuldade.get(r.questaoId)),
  },
];

/**
 * O vazio desta tabela.
 *
 * ⚠️ **Não é o `DashTableVazio`**: ele traz "tente limpar os filtros", e não há
 * filtro nenhum dentro deste modal. Mesma decisão do `VazioDeEstudantes` na
 * tela e do `VazioDeQuestoes` na aba.
 */
function VazioDeRespostas() {
  return (
    <div
      data-testid="respostas-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_SEM_RESPOSTAS}
      </p>
    </div>
  );
}

export interface EstudanteDoDetalhe {
  usuario: string;
  nome: string;
  matricula: string;
  /**
   * A linha inteira do relatório — a fonte de TODOS os números do bloco de
   * resumo (card 10).
   *
   * ⚠️ **Opcional**: quem monta o modal sem ela (testes que só exercitam a
   * tabela) simplesmente não ganha o bloco, e o resto segue igual.
   */
  linha?: LinhaDoRelatorio;
  /**
   * ⚠️ Necessário para reprocessar, e **opcional**: vem de
   * `LinhaDoRelatorio.historicoId`, que a api só manda para quem enviou
   * cartão. Sem ele não há o que reprocessar, e a ação simplesmente não
   * aparece — nunca um botão que só sabe dar 404.
   */
  historicoId?: string;
}

/**
 * O que UM estudante marcou num simulado, questão a questão.
 *
 * ⚠️ **Quem classifica acerto/erro/sem leitura é o ms**, não esta tela. A regra
 * de "sem leitura" é a AUSÊNCIA da chave `alternativaEstudante` — sutil, medida
 * em BSON real. Duas implementações dela divergiriam, e o número que o
 * professor usa para decidir o que revisar em aula sairia errado de um dos
 * lados.
 */
export function DetalheDoEstudante({
  token,
  simuladoId,
  estudante,
  isOpen,
  onClose,
  dificuldade,
  recorte = "cursinho",
  totalDeQuestoes = 0,
  mediaDoRecorte = null,
  materiasDaTurma = [],
}: {
  token: string;
  simuladoId: string;
  estudante: EstudanteDoDetalhe;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Acertos por questão no recorte, indexados por `questaoId`.
   *
   * ⚠️ **Opcional.** O agregado é carregado preguiçosamente pela tela (só na
   * primeira abertura da aba "Questões"), e abrir o modal dispara essa mesma
   * carga. Enquanto ela não volta — ou se falhar — a coluna mostra travessão,
   * em vez de o modal esperar por um dado que é acessório ao que ele veio
   * mostrar.
   */
  dificuldade?: Map<string, DificuldadeDaQuestao>;
  /**
   * De que recorte é o relatório aberto — decide o rótulo da coluna de
   * dificuldade. Padrão `cursinho`: é o caminho do `dashProvas`, e é o que
   * estava rotulado errado.
   */
  recorte?: RecorteDoRelatorio;
  /**
   * Quantas questões o simulado tem — denominador dos acertos (card 08).
   */
  totalDeQuestoes?: number;
  /** Média do recorte, base do desvio em p.p. (card 08). */
  mediaDoRecorte?: number | null;
  /** As matérias do recorte, com a média da turma (card 02). */
  materiasDaTurma?: MediaPorMateria[];
}) {
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("loading");

  const carregar = useCallback(() => {
    // ⚠️ Só com o modal aberto. Ele é renderizado pela tela do relatório junto
    // da linha; buscar sempre seria uma chamada por linha da tabela.
    if (!isOpen) return;
    setEstado("loading");
    buscarDetalheDoEstudante(token, simuladoId, estudante.usuario)
      .then((d) => {
        setDetalhe(d);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  }, [isOpen, token, simuladoId, estudante.usuario]);

  useEffect(carregar, [carregar]);

  const processando =
    detalhe?.status === "awaiting_omr" ||
    detalhe?.status === "pending" ||
    detalhe?.status === "processing";

  // ⚠️ `detalhe !== null`: enquanto carrega ainda não há status nenhum, e isso
  // não é "desconhecido" — é a tabela em estado `loading`.
  const statusDesconhecido =
    detalhe !== null && !STATUS_CONHECIDOS.includes(detalhe.status);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={onClose}
      className="w-full max-w-3xl rounded-lg bg-white p-4 shadow-xl"
    >
      <div className="flex flex-col gap-4">
        <header>
          <h2 className={cn("text-lg font-semibold", dashV2.text.primary)}>
            {estudante.nome}
          </h2>
          <p className={cn("text-xs", dashV2.text.muted)}>
            {estudante.matricula}
          </p>
        </header>

        {estado === "error" && (
          <div className="flex flex-col items-start gap-2">
            <p className={cn("text-sm", dashV2.text.secondary)}>
              Erro ao carregar o detalhe.
            </p>
            <button
              type="button"
              onClick={carregar}
              className={cn(
                "rounded-sm text-sm font-medium underline-offset-2 hover:underline",
                dashV2.text.primary,
                dashV2.focus,
              )}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/*
          ⚠️ Cartão falho mostra o MOTIVO, não uma tabela vazia. É a única
          informação acionável da tela neste caso — diz o que fazer com a folha.
        */}
        {estado === "idle" && detalhe?.status === "failed" && (
          <p className={cn("text-sm", dashV2.text.secondary)}>
            {detalhe.falha?.descricao ?? TEXTO_FALHA_SEM_DESCRICAO}
          </p>
        )}

        {/*
          ⚠️ O que oferecer sai do `acaoSugerida` que vem dentro da falha —
          esta tela não conhece código de erro nenhum. Sem `falha` não há ação
          sugerida, e oferecer "tentar de novo" por conta própria seria afirmar
          que tentar resolve.

          ⚠️ `onReenviado={carregar}` recarrega o detalhe, que volta como
          "processando". **Sem polling neste card**: tela que se atualiza
          sozinha é outro assunto.
        */}
        {estado === "idle" &&
          detalhe?.status === "failed" &&
          detalhe.falha &&
          estudante.historicoId && (
            <AcaoDeReenvio
              token={token}
              historicoId={estudante.historicoId}
              falha={detalhe.falha}
              onReenviado={carregar}
            />
          )}

        {estado === "idle" && processando && (
          <p className={cn("text-sm", dashV2.text.secondary)}>
            {TEXTO_PROCESSANDO}
          </p>
        )}

        {/*
          ⚠️ Status fora dos cinco conhecidos diz que não se sabe — não cai na
          tabela. A tabela vazia afirma "não respondeu nada"; isto aqui não
          afirma nada. Mesma postura do `default` do `statusDaLinha`.
        */}
        {estado === "idle" && statusDesconhecido && (
          <p
            data-testid="status-desconhecido"
            className={cn("text-sm", dashV2.text.secondary)}
          >
            {TEXTO_STATUS_DESCONHECIDO}
          </p>
        )}

        {/*
          ⚠️ **Mesma condição da tabela, de propósito** (card 10). `failed`,
          `processando` e status desconhecido já têm cada um a sua mensagem, e o
          modal é explícito em não afirmar nada nesses casos — um bloco de notas
          ao lado de "a leitura deste cartão falhou" afirmaria a leitura que não
          houve.

          ⚠️ `detalhe !== null` também: enquanto carrega não há `respostas` para
          contar o "sem leitura", e o bloco apareceria com a nota certa e a
          contagem zerada por um instante.
        */}
        {estado !== "error" &&
          !processando &&
          !statusDesconhecido &&
          detalhe !== null &&
          detalhe.status !== "failed" &&
          estudante.linha !== undefined && (
            <ResumoDoEstudante
              linha={estudante.linha}
              totalDeQuestoes={totalDeQuestoes}
              mediaDoRecorte={mediaDoRecorte}
              materiasDaTurma={materiasDaTurma}
              respostas={detalhe.respostas}
            />
          )}

        {estado !== "error" &&
          !processando &&
          !statusDesconhecido &&
          detalhe?.status !== "failed" && (
          /*
            ⚠️ Sem `onSortChange`: a ordem é a do ms (por número da questão), e
            deixar reordenar por "resultado" numa prova não acrescenta nada que
            não se veja de relance.
          */
          <DashTable<RespostaDoEstudante>
            rows={detalhe?.respostas ?? []}
            columns={colunasDoDetalhe(dificuldade ?? new Map(), recorte)}
            // `:i` porque a mesma questão pode aparecer duas vezes no simulado
            // (corrida conhecida do `adicionarEmProva`): as linhas seriam
            // idênticas, mas a key do React colidiria.
            rowKey={(r, i) => `${r.questaoId}:${i}`}
            state={estado}
            onRetry={carregar}
            stickyHeader
            emptyState={<VazioDeRespostas />}
          />
        )}
      </div>
    </ModalTemplate>
  );
}

export default DetalheDoEstudante;
