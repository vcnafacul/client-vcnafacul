import ModalTemplate from "@/components/templates/modalTemplate";
import { useToastAsync } from "@/hooks/useToastAsync";
import {
  AlertaEvasao,
  getAlertaEvasao,
  salvarAlertaEvasao,
} from "@/services/prepCourse/alertaEvasao";
import { useAuthStore } from "@/store/auth";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
import { useCallback, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { validarAlerta } from "./validarAlerta";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

/**
 * "Avisar risco de evasão a partir de X% de faltas" (tickets/054, card 03).
 * Evasão continua sendo matrícula cancelada; isto é só o alerta.
 */
export function AlertaEvasaoModal({ isOpen, handleClose }: Props) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();
  const [percentual, setPercentual] = useState("");
  const [minimo, setMinimo] = useState("10");
  const [carregou, setCarregou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  /** Falhou ao ler: sem isto os campos ficavam desabilitados para sempre. */
  const [erro, setErro] = useState(false);

  const carregar = useCallback(() => {
    setErro(false);
    getAlertaEvasao(token)
      .then((a: AlertaEvasao) => {
        setPercentual(a.percentual == null ? "" : String(a.percentual));
        setMinimo(String(a.minimoDeAulas));
        setCarregou(true);
      })
      .catch((e) => {
        setErro(true);
        toast.error(
          mensagemDeErro(e, "ver o alerta de evasão", "Erro ao carregar o alerta"),
        );
      });
  }, [token]);

  useEffect(() => carregar(), [carregar]);

  const erros = validarAlerta(percentual, minimo);
  const valido = !erros.percentual && !erros.minimo;
  const desligado = percentual.trim() === "";

  const salvar = async () => {
    setTentouSalvar(true);
    if (!valido) return;
    setSalvando(true);
    await executeAsync({
      action: () =>
        salvarAlertaEvasao(token, {
          percentual: desligado ? null : Number(percentual),
          minimoDeAulas: Number(minimo),
        }),
      loadingMessage: "Salvando alerta...",
      successMessage: desligado ? "Alerta desligado" : "Alerta salvo!",
      errorMessage: (e: unknown) =>
        mensagemDeErro(e, "salvar o alerta", "Erro ao salvar o alerta"),
      onSuccess: () => handleClose(),
      onFinally: () => setSalvando(false),
    });
  };

  // Exemplo com os números digitados: o menor nº de faltas que acende o alerta
  // logo na primeira aula em que ele pode aparecer.
  const exemplo = (() => {
    if (!valido || desligado) return null;
    const p = Number(percentual);
    const aulas = Number(minimo);
    // Inteiros antes de dividir: (28 / 100) * 25 dá 7,000000000000001 e o
    // ceil virava 8.
    const faltas = Math.ceil((p * aulas) / 100);
    return `Com ${p}% e ${aulas} aulas: um aluno com ${faltas} ${
      faltas === 1 ? "falta" : "faltas"
    } sem justificativa em ${aulas} aulas (${Math.round(
      (faltas / aulas) * 100,
    )}%) aparece em risco na chamada.`;
  })();

  const campo =
    "h-11 w-24 px-3 rounded-lg border text-marine text-lg font-bold text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-orange";

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      closer={false}
      className="bg-white rounded-xl shadow-xl w-[calc(100vw-1rem)] sm:w-[520px] max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden"
    >
      <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6 flex items-start justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-black text-marine leading-tight">
          Alerta de risco de evasão
        </h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="shrink-0 -mr-2 -mt-1 p-2 rounded-full text-grey hover:bg-gray-100 hover:text-marine"
        >
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 flex flex-col gap-4">
        <p className="text-sm text-grey">
          Na chamada, o aluno aparece em risco quando as faltas{" "}
          <strong>sem justificativa</strong> passam do percentual abaixo,
          contando só as aulas dele.
        </p>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-marine">
            Avisar a partir de
          </span>
          <span className="flex items-center gap-2">
            <input
              inputMode="numeric"
              aria-label="Percentual de faltas"
              value={percentual}
              disabled={!carregou}
              onChange={(e) => setPercentual(e.target.value)}
              placeholder="—"
              className={`${campo} ${
                tentouSalvar && erros.percentual ? "border-orange" : "border-lightGray"
              }`}
            />
            <span className="text-marine">% de faltas</span>
          </span>
          <span
            className={`text-xs ${
              tentouSalvar && erros.percentual ? "text-orange" : "text-grey"
            }`}
          >
            {tentouSalvar && erros.percentual
              ? erros.percentual
              : "Deixe vazio para não avisar."}
          </span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-marine">
            Começar a avisar depois de
          </span>
          <span className="flex items-center gap-2">
            <input
              inputMode="numeric"
              aria-label="Mínimo de aulas"
              value={minimo}
              disabled={!carregou}
              onChange={(e) => setMinimo(e.target.value)}
              className={`${campo} ${
                tentouSalvar && erros.minimo ? "border-orange" : "border-lightGray"
              }`}
            />
            <span className="text-marine">aulas do aluno</span>
          </span>
          <span
            className={`text-xs ${
              tentouSalvar && erros.minimo ? "text-orange" : "text-grey"
            }`}
          >
            {tentouSalvar && erros.minimo
              ? erros.minimo
              : "Nas primeiras aulas uma falta pesa muito; antes disso ninguém aparece em risco."}
          </span>
        </label>

        {erro && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-lightGray px-3 py-2">
            <p className="text-sm text-grey">
              Não foi possível carregar o alerta.
            </p>
            <button
              type="button"
              onClick={carregar}
              className="shrink-0 h-9 px-3 rounded-lg border border-marine/30 text-marine text-sm font-bold hover:bg-marine/5"
            >
              Tentar de novo
            </button>
          </div>
        )}

        <p
          aria-live="polite"
          className="text-sm rounded-lg bg-orange/5 border-l-4 border-orange px-3 py-2 text-marine min-h-[2.5rem]"
        >
          {desligado
            ? "Alerta desligado: a chamada não mostra risco de evasão."
            : exemplo ?? "Confira os valores acima."}
        </p>
      </div>

      <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-lightGray flex gap-2 justify-end">
        <button
          type="button"
          onClick={handleClose}
          className="h-11 px-5 rounded-lg border border-marine/30 text-marine font-bold hover:bg-marine/5"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={salvar}
          disabled={!carregou || salvando}
          className="h-11 px-6 rounded-lg bg-marine text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Salvar
        </button>
      </div>
    </ModalTemplate>
  );
}
