import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToastAsync } from "@/hooks/useToastAsync";
import {
  AlertaEvasao,
  getAlertaEvasao,
  salvarAlertaEvasao,
} from "@/services/prepCourse/alertaEvasao";
import { useAuthStore } from "@/store/auth";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/lib/toast";
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

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Alerta de risco de evasão</DialogTitle>
        </DialogHeader>

        <p className="text-body text-muted-foreground">
          Na chamada, o aluno aparece em risco quando as faltas{" "}
          <strong>sem justificativa</strong> passam do percentual abaixo,
          contando só as aulas dele.
        </p>

        <Field
          label="Avisar a partir de"
          hint="Deixe vazio para não avisar."
          error={tentouSalvar ? erros.percentual : undefined}
        >
          <Input
            inputMode="numeric"
            value={percentual}
            disabled={!carregou}
            onChange={(e) => setPercentual(e.target.value)}
            placeholder="—"
            suffix="% de faltas"
          />
        </Field>

        <Field
          label="Começar a avisar depois de"
          hint="Nas primeiras aulas uma falta pesa muito; antes disso ninguém aparece em risco."
          error={tentouSalvar ? erros.minimo : undefined}
        >
          <Input
            inputMode="numeric"
            value={minimo}
            disabled={!carregou}
            onChange={(e) => setMinimo(e.target.value)}
            suffix="aulas do aluno"
          />
        </Field>

        {erro && (
          <Alert
            variant="destructive"
            title="Não foi possível carregar o alerta."
            action={
              <Button type="button" variant="outline" size="sm" onClick={carregar}>
                Tentar de novo
              </Button>
            }
          />
        )}

        <Alert variant="info" title="Exemplo" role="status" aria-live="polite">
          {desligado
            ? "Alerta desligado: a chamada não mostra risco de evasão."
            : exemplo ?? "Confira os valores acima."}
        </Alert>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={salvar}
            disabled={!carregou || salvando}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
