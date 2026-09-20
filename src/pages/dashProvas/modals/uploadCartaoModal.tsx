import type { EstudanteEncontrado } from "@/dtos/cartaoResposta/buscaEstudante";
import { useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { uploadCartao } from "../../../services/cartaoResposta/uploadCartao";
import {
  MINIMO_PARA_BUSCAR,
  useBuscaDeEstudantes,
} from "./useBuscaDeEstudantes";

export const TEXTO_PLACEHOLDER = "Matrícula, nome ou sobrenome";
export const TEXTO_DIGITE_MAIS = `Digite ao menos ${MINIMO_PARA_BUSCAR} caracteres`;
export const TEXTO_BUSCANDO = "Buscando...";
export const TEXTO_NADA_ENCONTRADO = "Nenhum estudante encontrado";
export const TEXTO_ERRO_BUSCA = "Não foi possível buscar agora";
export const TEXTO_TROCAR = "Trocar";
export const TEXTO_SEM_TURMA = "Sem turma";

interface UploadCartaoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  token: string;
}

export default function UploadCartaoModal({
  isOpen,
  handleClose,
  token,
}: UploadCartaoModalProps) {
  const [termo, setTermo] = useState("");
  /** `null` = ainda escolhendo. Enquanto for nulo, a lista manda na tela. */
  const [escolhido, setEscolhido] = useState<EstudanteEncontrado | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  /*
    ⚠️ A busca para quando alguém já foi escolhido: sem isso, o termo continua
    no campo e o hook segue consultando a cada render — gastando rede para
    montar uma lista que a tela não mostra mais.
  */
  const { estudantes, estado } = useBuscaDeEstudantes(
    escolhido ? "" : termo,
    token,
  );

  const reset = () => {
    setTermo("");
    setEscolhido(null);
    setFile(null);
  };

  const fechar = () => {
    reset();
    handleClose();
  };

  const handleEnviar = async () => {
    if (!escolhido || !file) return;
    setEnviando(true);
    const id = toast.loading("Enviando cartão...");
    try {
      await uploadCartao(file, escolhido.userId, token);
      toast.update(id, {
        render:
          "Cartão enviado. O resultado aparece aqui quando o processamento terminar.",
        type: "info",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
      fechar();
    } catch (err) {
      toast.update(id, {
        render: (err as Error).message || "Erro ao enviar o cartão",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={fechar}
      className="w-full max-w-lg rounded-lg bg-white shadow-xl p-2"
    >
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Enviar cartão de resposta</h2>

        {/*
          ⚠️ Sem botão "Buscar": a consulta sai sozinha 500ms depois da última
          tecla. O botão obrigava um clique a mais para cada tentativa, e numa
          busca por nome quase sempre são várias tentativas.
        */}
        {!escolhido && (
          <div className="space-y-2">
            <input
              type="text"
              autoFocus
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder={TEXTO_PLACEHOLDER}
              data-testid="busca-estudante"
              aria-label={TEXTO_PLACEHOLDER}
              className="w-full border rounded px-3 py-2"
            />

            {/*
              ⚠️ Cada estado diz o que está acontecendo. Uma lista vazia sem
              texto nenhum é indistinguível de "ainda não busquei", e é o que
              faz a pessoa ficar digitando à espera de algo que já terminou.
            */}
            {termo.trim().length > 0 &&
              termo.trim().length < MINIMO_PARA_BUSCAR && (
                <p className="text-sm text-gray-500">{TEXTO_DIGITE_MAIS}</p>
              )}
            {estado === "buscando" && (
              <p className="text-sm text-gray-500">{TEXTO_BUSCANDO}</p>
            )}
            {estado === "erro" && (
              <p className="text-sm text-red-600">{TEXTO_ERRO_BUSCA}</p>
            )}
            {estado === "pronto" && estudantes.length === 0 && (
              <p className="text-sm text-gray-500">{TEXTO_NADA_ENCONTRADO}</p>
            )}

            {estudantes.length > 0 && (
              <ul
                data-testid="sugestoes-estudante"
                className="max-h-64 overflow-auto divide-y rounded border"
              >
                {estudantes.map((e) => (
                  <li key={e.userId}>
                    <button
                      type="button"
                      onClick={() => setEscolhido(e)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="block font-medium">{e.nome}</span>
                      {/*
                        ⚠️ Matrícula E turma embaixo: dois estudantes com o
                        mesmo nome são caso real, e sem isso não há como saber
                        para qual dos dois o cartão vai.
                      */}
                      <span className="block text-xs text-gray-500">
                        {e.matricula} · {e.turma ?? TEXTO_SEM_TURMA}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {escolhido && (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3 rounded border p-3">
              <div>
                <p className="font-medium">{escolhido.nome}</p>
                <p className="text-sm text-gray-500">
                  {escolhido.matricula} · {escolhido.turma ?? TEXTO_SEM_TURMA}
                </p>
              </div>
              {/*
                ⚠️ "Trocar" devolve a busca. Sem ele, corrigir uma escolha
                errada exigiria fechar o modal e recomeçar — e o envio é a ação
                que não dá para desfazer.
              */}
              <button
                type="button"
                onClick={() => {
                  setEscolhido(null);
                  setTermo("");
                }}
                className="shrink-0 text-sm underline"
              >
                {TEXTO_TROCAR}
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <button
              onClick={handleEnviar}
              disabled={!file || enviando}
              className="w-full px-4 py-2 bg-green2 text-white rounded disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar cartão"}
            </button>
          </div>
        )}
      </div>
    </ModalTemplate>
  );
}
