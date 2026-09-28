import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LOGIN_PATH } from "@/routes/path";
import { useNavigate } from "react-router-dom";

/**
 * Deslogado clicou em "informação correta" (card 09). Opção (a), decidida em
 * 2026-09-27: o botão só leva ao login — que depois vai ao dashboard, como
 * sempre (voltar à busca exigiria mexer no login e no retorno do Google).
 */
export function AvisoLogin({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Entre para confirmar informações</DialogTitle>
          <DialogDescription>
            Só quem tem conta pode confirmar que os dados de um cursinho estão
            corretos — assim o contador é de pessoas de verdade.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onFechar}>
            Agora não
          </Button>
          <Button
            className="bg-orange text-white hover:bg-orange/90"
            onClick={() => navigate(LOGIN_PATH)}
          >
            Entrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
