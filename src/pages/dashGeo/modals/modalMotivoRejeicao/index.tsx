import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
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
    <Dialog
      open={isOpen}
      onOpenChange={(aberto) => {
        if (!aberto) handleClose();
      }}
      size="sm"
    >
      <DialogContent
        aria-describedby={undefined}
        // Dados digitados: clique fora não fecha (R32).
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Por que este cadastro está sendo rejeitado?</DialogTitle>
        </DialogHeader>
        <RadioGroup
          aria-label="Motivo da rejeição"
          value={motivo ?? ""}
          onValueChange={(valor) => setMotivo(valor as MotivoRejeicaoGeo)}
        >
          {MOTIVOS_DE_REJEICAO.map((m) => (
            <RadioGroupItem key={m.valor} value={m.valor} label={m.rotulo} />
          ))}
        </RadioGroup>
        <Field
          label={ehOutro ? "Descreva o motivo" : "Complemento (opcional)"}
          maxLength={MAXIMO}
        >
          <Textarea
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            placeholder={
              ehOutro
                ? "Obrigatório para “Outro”"
                : "Ex.: igual ao cadastro do Cursinho X"
            }
            className="resize-none"
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!valido}
            onClick={() => onConfirm(motivo!, complemento.trim() || undefined)}
          >
            Rejeitar cadastro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
