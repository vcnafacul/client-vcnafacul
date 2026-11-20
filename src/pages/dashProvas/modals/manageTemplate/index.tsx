import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToastAsync } from "../../../../hooks/useToastAsync";
import { baixarModelo } from "../../../../services/caderno/template/baixarModelo";
import { ErroDeLint } from "../../../../services/caderno/template/erros";
import { obterPublicada } from "../../../../services/caderno/template/obterPublicada";
import { obterRascunho } from "../../../../services/caderno/template/obterRascunho";
import { publicar } from "../../../../services/caderno/template/publicar";
import { subirRascunho } from "../../../../services/caderno/template/subirRascunho";
import {
  RelatorioDoRascunho,
  VersaoTemplate,
} from "../../../../services/caderno/template/tipos";
import { useAuthStore } from "../../../../store/auth";
import { formatDate } from "../../../../utils/date";
import { calcularEstado } from "./estados";
import ConfirmarDescarte from "./confirmarDescarte";
import Historico from "./historico";

interface ManageTemplateProps {
  isOpen: boolean;
  handleClose: () => void;
}

type View = "principal" | "descartar" | "historico";

function ManageTemplate({ isOpen, handleClose }: ManageTemplateProps) {
  const {
    data: { token },
  } = useAuthStore();

  const execute = useToastAsync();

  const [view, setView] = useState<View>("principal");

  const [carregando, setCarregando] = useState(true);
  const [publicada, setPublicada] = useState<VersaoTemplate | null>(null);
  /**
   * O rascunho que já estava salvo quando a tela abriu.
   *
   * ⚠️ Não é a mesma coisa que o `relatorio`, e por isso vai separado para a
   * máquina: o relatório só existe logo depois de um upload, enquanto o
   * rascunho salvo é o estado normal de quem restaurou uma versão. Quem decide
   * o que fazer com os dois é o `calcularEstado`, não este componente.
   */
  const [rascunhoSalvo, setRascunhoSalvo] = useState<VersaoTemplate | null>(
    null,
  );
  const [relatorio, setRelatorio] = useState<RelatorioDoRascunho | null>(null);

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [notas, setNotas] = useState("");

  const [baixando, setBaixando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    Promise.all([obterPublicada(token), obterRascunho(token)])
      .then(([versaoPublicada, rascunho]) => {
        if (!ativo) return;
        setPublicada(versaoPublicada);
        setRascunhoSalvo(rascunho);
      })
      .catch((erro: Error) => toast.error(erro.message))
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  /**
   * Relê publicada + rascunho do servidor.
   *
   * ⚠️ Depois de restaurar não dá para inventar o rascunho aqui: o `restaurar`
   * responde sem corpo, e a versão e as notas do rascunho novo são escritas
   * pelo ms ("restaurada da versão N"). Pintar um rascunho de mentira na aba
   * principal é exatamente a falha silenciosa que esta tela não pode ter.
   */
  const recarregar = async () => {
    setCarregando(true);
    try {
      const [versaoPublicada, rascunho] = await Promise.all([
        obterPublicada(token),
        obterRascunho(token),
      ]);
      setPublicada(versaoPublicada);
      setRascunhoSalvo(rascunho);
    } catch (erro) {
      toast.error((erro as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  // ⚠️ `carregando` entra na máquina, não no JSX: o vazio desta tela diz
  // "nenhuma versão publicada", e piscar isso a cada abertura do modal treina
  // o coordenador a ignorar o aviso que mais importa.
  const estado = calcularEstado({
    carregando,
    publicada,
    rascunhoSalvo,
    relatorio,
  });

  const handleBaixarModelo = async () => {
    if (baixando) return;
    setBaixando(true);
    await execute({
      action: () => baixarModelo({}, token),
      loadingMessage: "Preparando o zip do modelo...",
      successMessage: "Modelo baixado. Suba esse zip no Overleaf.",
      errorMessage: (err: Error) => err.message,
      onSuccess: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "template-caderno.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      onFinally: () => setBaixando(false),
    });
  };

  const handleEnviar = async () => {
    if (!arquivo || enviando) return;
    setEnviando(true);
    await execute({
      action: () => subirRascunho(arquivo, notas, token),
      loadingMessage: "Enviando o projeto...",
      // ⚠️ A api responde 200 mesmo com o lint reprovado, de propósito: o
      // rascunho é salvo para quem acabou de editar no Overleaf não perder o
      // zip. Um "enviado com sucesso" verde nessa hora faz o coordenador
      // fechar o modal achando que publicou, e a prova seguinte sai com o
      // template velho sem nada falhar. Por isso a mensagem sai do relatório.
      //
      // A string vazia faz o hook dispensar o toast de loading em vez de
      // pintá-lo de verde; o relatório reprovado sai logo abaixo como
      // `warning`, que é o que ele é.
      successMessage: (rel: RelatorioDoRascunho) =>
        rel.erros.length > 0
          ? ""
          : "Rascunho salvo e conferido. Agora falta publicar.",
      errorMessage: (err: Error) => err.message,
      onSuccess: (rel: RelatorioDoRascunho) => {
        setRelatorio(rel);
        setRascunhoSalvo(null);
        setArquivo(null);
        if (rel.erros.length > 0) {
          toast.warning(
            `O rascunho foi salvo, mas ${
              rel.erros.length === 1
                ? "1 erro precisa ser corrigido"
                : `${rel.erros.length} erros precisam ser corrigidos`
            } antes de publicar. Veja a lista na tela.`,
            { autoClose: 8000 },
          );
        }
      },
      onFinally: () => setEnviando(false),
    });
  };

  const handlePublicar = async () => {
    if (publicando) return;
    setPublicando(true);
    await execute({
      action: () => publicar(token),
      loadingMessage: "Publicando...",
      successMessage: (versao: VersaoTemplate) =>
        `v${versao.versao} publicada. As próximas provas já usam ela.`,
      errorMessage: (err: Error) => err.message,
      onSuccess: (versao: VersaoTemplate) => {
        setPublicada(versao);
        setRelatorio(null);
        setRascunhoSalvo(null);
      },
      onError: (err: Error) => {
        // ⚠️ O 409 do publicar carrega a LISTA de erros. Ela volta para o
        // relatório — que é de onde a máquina de estados tira `podePublicar` e
        // a tela tira a lista — em vez de virar um segundo canal que diverge.
        if (err instanceof ErroDeLint) {
          setRelatorio((atual) => ({
            aceitos: atual?.aceitos ?? [],
            ignorados: atual?.ignorados ?? [],
            avisos: atual?.avisos ?? [],
            erros: err.erros,
          }));
        }
      },
      onFinally: () => setPublicando(false),
    });
  };

  const handleDescartado = () => {
    setRelatorio(null);
    setRascunhoSalvo(null);
    setView("principal");
  };

  /**
   * ⚠️ Restaurar devolve para a aba principal: agora HÁ um rascunho pendente,
   * e é lá que ele publica. O `relatorio` vai a `null` porque o rascunho
   * restaurado não tem relatório de lint nenhum — a máquina chama isso de
   * `rascunho-sem-relatorio`, e o lint roda de novo no publicar.
   */
  const handleRestaurado = () => {
    setRelatorio(null);
    setView("principal");
    void recarregar();
  };

  const versaoNoAr =
    estado.tipo === "carregando" ? (
      <span className="text-body text-muted-foreground">Carregando...</span>
    ) : estado.versaoNoAr === null ? (
      <span className="text-body font-medium text-warning">
        Nenhuma versão publicada ainda.
      </span>
    ) : (
      <span className="text-body text-muted-foreground">
        Versão <span className="font-semibold">v{estado.versaoNoAr}</span> no ar
        {publicada?.publicadaEm
          ? ` — publicada em ${formatDate(publicada.publicadaEm)}`
          : ""}
      </span>
    );

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        size="lg"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">
            {view === "descartar"
              ? "Descartar rascunho"
              : view === "historico"
                ? "Histórico de versões"
                : "Template do caderno"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {view === "descartar" ? (
            <ConfirmarDescarte
              token={token}
              versaoNoAr={estado.versaoNoAr}
              onDescartado={handleDescartado}
              onCancel={() => setView("principal")}
            />
          ) : view === "historico" ? (
            <Historico
              token={token}
              versaoNoAr={estado.versaoNoAr}
              onRestaurado={handleRestaurado}
              onVoltar={() => setView("principal")}
            />
          ) : (
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-info-muted p-2">
                  <FileText className="h-6 w-6 text-info" />
                </div>
                <p className="text-h2 font-semibold text-foreground">
                  Template do caderno
                </p>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView("historico")}
                  >
                    Histórico de versões
                  </Button>
                </div>
              </div>
              <div className="mb-6">{versaoNoAr}</div>

              {/* ⚠️ Os três passos ficam NA TELA, não em tooltip: quem usa isto
              abre a tela uma vez por trimestre e não lembra da ordem. */}
              <ol className="flex flex-col gap-5">
                <li className="rounded-lg border border-border p-4">
                  <p className="font-semibold text-foreground">
                    1. Baixe o zip do modelo
                  </p>
                  <p className="mt-1 text-body text-muted-foreground">
                    É o template que está no ar hoje, do jeito que ele sai.
                    Parta sempre dele — não comece um projeto do zero.
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={baixando}
                      onClick={handleBaixarModelo}
                    >
                      Baixar zip do modelo
                    </Button>
                  </div>
                </li>

                <li className="rounded-lg border border-border p-4">
                  <p className="font-semibold text-foreground">
                    2. Edite no Overleaf e confira o PDF
                  </p>
                  <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-body text-muted-foreground">
                    <li>
                      Entre no <span className="font-medium">overleaf.com</span>{" "}
                      e crie um projeto novo em{" "}
                      <span className="font-medium">
                        &quot;New Project &gt; Upload Project&quot;
                      </span>
                      , enviando esse zip inteiro.
                    </li>
                    <li>
                      Altere <span className="font-mono">main.tex</span> e{" "}
                      <span className="font-mono">preambulo.tex</span> — são
                      eles que definem a capa e as fontes.
                    </li>
                    <li>
                      Clique em{" "}
                      <span className="font-medium">&quot;Recompile&quot;</span>{" "}
                      e <span className="font-semibold">confira o PDF</span>{" "}
                      antes de trazer de volta. O que não compila lá não publica
                      aqui.
                    </li>
                    <li>
                      Terminado, baixe o{" "}
                      <span className="font-semibold">projeto inteiro</span>{" "}
                      pelo{" "}
                      <span className="font-medium">&quot;Download&quot;</span>{" "}
                      do Overleaf.
                    </li>
                    <li>
                      Não separe arquivo nenhum nem monte um zip à mão: a
                      plataforma abre o zip e pega os dois de dentro.
                    </li>
                  </ul>
                </li>

                <li className="rounded-lg border border-border p-4">
                  <p className="font-semibold text-foreground">
                    3. Envie o zip do Overleaf aqui
                  </p>
                  <p className="mt-1 text-body text-muted-foreground">
                    A plataforma confere o zip e guarda como rascunho. Publicar
                    é o passo seguinte — até lá, nada muda para as provas.
                  </p>

                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      type="file"
                      accept=".zip,application/zip"
                      onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                      className="text-body"
                    />
                    <input
                      type="text"
                      value={notas}
                      placeholder="Notas da versão (opcional) — ex.: nova logo da capa"
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-full rounded-md border border-border px-3 py-2 text-body"
                    />
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!arquivo || enviando}
                        onClick={handleEnviar}
                      >
                        Enviar zip
                      </Button>
                    </div>
                  </div>
                </li>
              </ol>

              {/* ⚠️ Não é um aviso de impedimento, é uma explicação: rascunho
              salvo PUBLICA. O lint roda de novo no publicar (card 10) — o
              veredito sai no clique, e um 409 devolve a lista, que cai em
              `relatorio.erros` e desliga o botão pela máquina. Este é o estado
              normal depois de restaurar uma versão. Os gates continuam sendo
              `estado.podePublicar` / `estado.podeDescartar`. */}
              {estado.tipo === "rascunho-sem-relatorio" &&
                rascunhoSalvo !== null && (
                  <div className="mt-6 rounded-lg border border-border p-4">
                    <p className="text-body font-semibold text-foreground">
                      Há um rascunho salvo (v{rascunhoSalvo.versao})
                      {rascunhoSalvo.notas ? ` — ${rascunhoSalvo.notas}` : ""}.
                    </p>
                    <p className="mt-1 text-body text-muted-foreground">
                      A conferência dele acontece ao publicar: se algo não
                      passar, a lista do que corrigir aparece aqui e nada é
                      publicado.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!estado.podeDescartar}
                        onClick={() => setView("descartar")}
                      >
                        Descartar rascunho
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!estado.podePublicar || publicando}
                        onClick={handlePublicar}
                      >
                        Publicar
                      </Button>
                    </div>
                  </div>
                )}

              {(estado.tipo === "rascunho-com-erro" ||
                estado.tipo === "rascunho-limpo") && (
                <div className="mt-6 rounded-lg border border-border p-4">
                  <p className="mb-3 font-semibold text-foreground">
                    Conferência do rascunho
                  </p>

                  {relatorio && relatorio.aceitos.length > 0 && (
                    <div className="mb-3">
                      <p className="text-body font-medium text-foreground">
                        Arquivos usados
                      </p>
                      <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5 text-body text-muted-foreground">
                        {relatorio.aceitos.map((nome) => (
                          <li key={nome} className="font-mono">
                            {nome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ⚠️ Os ignorados aparecem sempre que existirem: o zip do
                  Overleaf traz o projeto inteiro e a plataforma pega dois
                  arquivos. Sem esta lista ele acha que subiu mais do que
                  subiu — e um dia jura que trocou a logo pela tela. */}
                  {estado.mostrarIgnorados && (
                    <div className="mb-3">
                      <p className="text-body font-medium text-foreground">
                        Arquivos ignorados — vieram no zip e{" "}
                        <span className="font-semibold">não</span> foram usados
                      </p>
                      <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5 text-body text-muted-foreground">
                        {estado.ignorados.map((nome) => (
                          <li key={nome} className="font-mono">
                            {nome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {estado.erros.length > 0 && (
                    <div className="mb-3 rounded-md border border-destructive bg-destructive-muted p-3">
                      <p className="text-body font-semibold text-destructive">
                        Corrija no Overleaf e envie de novo — sem isto não dá
                        para publicar:
                      </p>
                      <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5 text-body text-destructive">
                        {estado.erros.map((erro, i) => (
                          <li key={`${i}-${erro}`}>{erro}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {estado.avisos.length > 0 && (
                    <div className="mb-3 rounded-md border border-warning/40 bg-warning-muted p-3">
                      <p className="text-body font-semibold text-warning">
                        Vale conferir — não impede publicar:
                      </p>
                      <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5 text-body text-warning">
                        {estado.avisos.map((aviso, i) => (
                          <li key={`${i}-${aviso}`}>{aviso}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!estado.podeDescartar}
                      onClick={() => setView("descartar")}
                    >
                      Descartar rascunho
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!estado.podePublicar || publicando}
                      onClick={handlePublicar}
                    >
                      Publicar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default ManageTemplate;
