import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { useState } from "react";
import { MOTIVOS_DE_REJEICAO, MotivoRejeicaoGeo } from "./motivos";

const MAXIMO = 500;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  onConfirm: (motivo: MotivoRejeicaoGeo, complemento?: string) => void;
}

/**
 * Rejeitar pede um motivo da lista. O texto complementa qualquer motivo e só
 * é obrigatório no "Outro".
 */
export function ModalMotivoRejeicao({ isOpen, handleClose, onConfirm }: Props) {
  const [motivo, setMotivo] = useState<MotivoRejeicaoGeo>();
  const [complemento, setComplemento] = useState("");

  const ehOutro = motivo === MotivoRejeicaoGeo.Outro;
  const valido = !!motivo && (!ehOutro || !!complemento.trim());

  return (
    <ModalConfirmCancel
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={() => onConfirm(motivo!, complemento.trim() || undefined)}
      text="Por que este cadastro está sendo rejeitado?"
      confirmDisabled={!valido}
      className="max-w-[500px] bg-white p-4"
    >
      <fieldset className="flex flex-col gap-2 w-full text-left">
        <legend className="sr-only">Motivo da rejeição</legend>
        {MOTIVOS_DE_REJEICAO.map((m) => (
          <label key={m.valor} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="motivo-rejeicao"
              value={m.valor}
              checked={motivo === m.valor}
              onChange={() => setMotivo(m.valor)}
            />
            {m.rotulo}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 w-full text-left text-sm">
        {ehOutro ? "Descreva o motivo" : "Complemento (opcional)"}
        <textarea
          value={complemento}
          maxLength={MAXIMO}
          onChange={(e) => setComplemento(e.target.value)}
          placeholder={
            ehOutro
              ? "Obrigatório para “Outro”"
              : "Ex.: igual ao cadastro do Cursinho X"
          }
          className="p-2 w-full border border-gray-400 rounded min-h-[80px] resize-none"
        />
        <span className="self-end text-xs text-gray-500">
          {complemento.length}/{MAXIMO}
        </span>
      </label>
    </ModalConfirmCancel>
  );
}
