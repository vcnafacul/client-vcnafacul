import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DonoDaProva } from "@/dtos/prova/donoDaProva";
import type { ProvaQueImpede } from "@/services/question/updateStatus";
import { useState } from "react";

/**
 * Quando o validador do cursinho não pode recusar a questão (tickets/024,
 * cards 03 e 05): ela está em provas de outros cursinhos ou da plataforma, e
 * recusar mudaria o trabalho deles. Mostra as provas e oferece o que ele PODE
 * fazer — tirar das próprias provas, ou pedir à equipe que revise.
 */
export const TITULO_RECUSA_BLOQUEADA = "Esta questão é usada em outras provas";
export const TEXTO_RECUSA_BLOQUEADA =
  "Recusar muda a questão para todo mundo. Ela está em:";
export const TEXTO_SEM_EDITAR =
  "Para tirar das suas provas, você precisa da permissão de editar questões do cursinho.";
export const MOTIVO_MIN = 10;
export const MOTIVO_MAX = 500;

type ProvaNoModal = ProvaQueImpede & DonoDaProva;

/**
 * Como cada prova aparece: sua, oficial (só categoria fora de uso), da
 * plataforma, ou de qual cursinho — a mesma regra do `seloDaProva`.
 */
export function deQuemE(p: ProvaNoModal): string {
  if (p.podeComporProva) return "sua";
  if (p.selecionavel === false) return "oficial";
  if (!p.cursinhoId) return "da plataforma";
  return p.cursinhoNome || "outro cursinho";
}

export function ModalRecusaBloqueada({
  provas,
  onTirarDasMinhas,
  onSinalizar,
  onCancelar,
  ocupado = false,
}: {
  /** As provas do 403, completadas com o que o `provasContendo` sabe. */
  provas: ProvaNoModal[];
  /** Ausente = a pessoa não tem `editarQuestoesCursinho`, ou não há prova sua. */
  onTirarDasMinhas?: () => void;
  onSinalizar: (motivo: string) => void;
  onCancelar: () => void;
  ocupado?: boolean;
}) {
  const [sinalizando, setSinalizando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const motivoOk =
    motivo.trim().length >= MOTIVO_MIN && motivo.trim().length <= MOTIVO_MAX;

  return (
    <div
      role="dialog"
      aria-label={TITULO_RECUSA_BLOQUEADA}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-lg max-h-full overflow-y-auto rounded-lg bg-white p-4 shadow-xl flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{TITULO_RECUSA_BLOQUEADA}</h2>
        <p className="text-sm text-gray-600">{TEXTO_RECUSA_BLOQUEADA}</p>
        <ul className="text-sm list-disc pl-5" data-provas-da-recusa>
          {provas.map((p) => (
            <li key={p.provaId}>
              {p.provaNome} — <em>{deQuemE(p)}</em>
            </li>
          ))}
        </ul>

        {sinalizando ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600">
              Por que esta questão precisa de revisão?
            </label>
            <Textarea
              aria-label="Motivo da revisão"
              value={motivo}
              maxLength={MOTIVO_MAX}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: o gabarito está errado — a correta é a C."
            />
            <p className="text-xs text-gray-500">
              {motivo.trim().length}/{MOTIVO_MAX} (mínimo {MOTIVO_MIN})
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSinalizando(false)}
              >
                Voltar
              </Button>
              <Button
                size="sm"
                disabled={!motivoOk || ocupado}
                onClick={() => onSinalizar(motivo.trim())}
              >
                Enviar para revisão
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancelar}>
              Cancelar
            </Button>
            <span title={onTirarDasMinhas ? undefined : TEXTO_SEM_EDITAR}>
              <Button
                variant="outline"
                size="sm"
                disabled={!onTirarDasMinhas || ocupado}
                onClick={onTirarDasMinhas}
              >
                Tirar das minhas provas
              </Button>
            </span>
            <Button
              size="sm"
              disabled={ocupado}
              onClick={() => setSinalizando(true)}
            >
              Sinalizar para revisão
            </Button>
          </div>
        )}
        {/* O `title` do botão não aparece no toque: o motivo fica à vista. */}
        {!sinalizando && !onTirarDasMinhas && (
          <p className="text-right text-xs text-gray-500">{TEXTO_SEM_EDITAR}</p>
        )}
      </div>
    </div>
  );
}
