import { isCompartilhada, ICategoria } from "@/dtos/categoria/categoria";
import { SimuladoResumo } from "@/dtos/prova/prova";
import { baixarCadernoDaProva } from "@/services/caderno/baixarCadernoDaProva";
import { ErroCadernoComAnuladas } from "@/services/caderno/baixarCaderno";
import { ModalCadernoComAnuladas } from "@/components/molecules/anulacao/ModalCadernoComAnuladas";
import { baixarCartaoDaProva } from "@/services/cartaoResposta/baixarCartaoDaProva";
import {
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { ModalBaixarCartao } from "./ModalBaixarCartao";
import {
  motivoMaterialDaProva,
  TEXTO_CADERNO_DA_PROVA,
  TEXTO_CARTAO_DA_PROVA,
} from "./materialDaProva.regras";

function salvar(blob: Blob, nome: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * tickets/038 (R5/R6) — "Cartão da prova" e "Caderno da prova" no ShowProva, só para as
 * provas Enem Dia 1/2 do cursinho: um cartão (com a marcação de Inglês/Espanhol no Dia 1) e um
 * caderno para os simulados da prova. Por simulado, o cartão e o caderno seguem em "Ver
 * simulados".
 *
 * ⚠️ Só a tela do cursinho monta (a `dashProvas` não passa `material`). O `span` carrega o
 * motivo: botão desabilitado não dispara evento de ponteiro, e o `title` nele nunca apareceria.
 */
export function MaterialDaProva({
  prova,
  categoria,
  simulados,
  token,
}: {
  prova: { _id: string; nome: string };
  categoria?: Pick<ICategoria, "dono"> | null;
  simulados?: Pick<SimuladoResumo, "bloqueado">[];
  token: string;
}) {
  const [cartaoPedido, setCartaoPedido] = useState(false);
  const [baixandoCaderno, setBaixandoCaderno] = useState(false);
  // tickets/042 (D8): os números anulados, quando o ms pediu confirmação.
  const [anuladas, setAnuladas] = useState<number[] | null>(null);

  if (!isCompartilhada(categoria)) return null;
  const motivo = motivoMaterialDaProva(simulados);

  const baixarCartao = async () => {
    const id = toast.loading("Baixando cartão da prova...");
    try {
      salvar(
        await baixarCartaoDaProva(prova._id, token),
        `cartao_${prova.nome}.pdf`,
      );
      toast.update(id, {
        render: "Cartão baixado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (erro) {
      toast.update(id, {
        render:
          erro instanceof Error ? erro.message : "Erro ao baixar o cartão",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    }
  };

  const baixarCaderno = async (confirmarAnuladas = false) => {
    if (baixandoCaderno) return;
    setBaixandoCaderno(true);
    const id = toast.loading("Gerando caderno da prova...");
    try {
      const { blob, avisos } = await baixarCadernoDaProva(
        prova._id,
        token,
        confirmarAnuladas,
      );
      salvar(blob, `caderno_${prova.nome}.zip`);
      toast.update(id, {
        render:
          avisos > 0
            ? `Caderno gerado com ${avisos} ${
                avisos === 1 ? "observação" : "observações"
              } — confira as questões marcadas`
            : "Caderno baixado com sucesso!",
        type: avisos > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: avisos > 0 ? 8000 : 3000,
        closeOnClick: true,
      });
    } catch (erro) {
      if (erro instanceof ErroCadernoComAnuladas) {
        toast.dismiss(id);
        setAnuladas(erro.numeros);
        return;
      }
      toast.update(id, {
        render:
          erro instanceof Error ? erro.message : "Erro ao baixar o caderno",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    } finally {
      setBaixandoCaderno(false);
    }
  };

  return (
    <>
      {anuladas && (
        <ModalCadernoComAnuladas
          numeros={anuladas}
          onCancelar={() => setAnuladas(null)}
          onConfirmar={() => {
            setAnuladas(null);
            void baixarCaderno(true);
          }}
        />
      )}
      <span title={motivo} className="w-full sm:w-auto">
        <Button
          onClick={() => setCartaoPedido(true)}
          disabled={motivo !== undefined}
          variant="outlined"
          color="primary"
          className="w-full sm:w-auto"
          data-testid="cartao-da-prova"
          sx={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <ClipboardDocumentCheckIcon className="h-4 w-4" />
          {TEXTO_CARTAO_DA_PROVA}
        </Button>
      </span>
      <span title={motivo} className="w-full sm:w-auto">
        <Button
          onClick={() => baixarCaderno()}
          disabled={motivo !== undefined || baixandoCaderno}
          variant="outlined"
          color="primary"
          className="w-full sm:w-auto"
          data-testid="caderno-da-prova"
          sx={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <BookOpenIcon className="h-4 w-4" />
          {TEXTO_CADERNO_DA_PROVA}
        </Button>
      </span>
      {/* As orientações de leitura antes de baixar (client#900). */}
      {cartaoPedido && (
        <ModalBaixarCartao
          nomeSimulado={prova.nome}
          aberto
          onFechar={() => setCartaoPedido(false)}
          onBaixar={() => {
            setCartaoPedido(false);
            baixarCartao();
          }}
        />
      )}
    </>
  );
}
