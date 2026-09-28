import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GEOLOCATION_REGISTER } from "@/routes/path";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ID_DA_BUSCA } from "./BuscaCursinhos";

type Props = {
  aberto: boolean;
  onFechar: () => void;
  /** O que a pessoa buscou (card 06), se buscou. */
  termo: string;
};

/**
 * "Você não encontrou o cursinho?" (card 08). O objetivo da tela é evitar
 * cadastro duplicado: antes de ir ao formulário, um lembrete de conferir outro
 * nome/cidade. O termo buscado vira o nome pré-preenchido no cadastro.
 */
export function ModalNaoEncontrei({ aberto, onFechar, termo }: Props) {
  const navigate = useNavigate();
  const voltarParaBusca = useRef(false);
  const t = termo.trim();

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent
        className="max-w-lg"
        // "Voltar e buscar de novo" leva o foco ao campo de busca; qualquer
        // outro fechamento (Esc, ✕) devolve o foco ao botão, como o padrão.
        onCloseAutoFocus={(e) => {
          if (!voltarParaBusca.current) return;
          voltarParaBusca.current = false;
          e.preventDefault();
          document.getElementById(ID_DA_BUSCA)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Você não encontrou o cursinho?</DialogTitle>
          <DialogDescription>
            Antes de cadastrar, confira se ele não está com outro nome ou em
            outra cidade. Cadastros duplicados atrasam a validação.
          </DialogDescription>
        </DialogHeader>
        {t && (
          <p className="text-sm text-slate-600">
            Você buscou por: <strong>"{t}"</strong>
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              voltarParaBusca.current = true;
              onFechar();
            }}
          >
            Voltar e buscar de novo
          </Button>
          <Button
            className="bg-orange text-white hover:bg-orange/90"
            onClick={() =>
              navigate(
                GEOLOCATION_REGISTER,
                t ? { state: { name: t } } : undefined,
              )
            }
          >
            Não encontrei, cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
