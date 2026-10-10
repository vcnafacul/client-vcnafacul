import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrientacoesDoCartao } from "./OrientacoesDoCartao";

export const TEXTO_BAIXAR_CARTAO = "Baixar cartão";

/**
 * Antes de baixar o cartão, as orientações de leitura. É o momento de passá-las adiante:
 * quem baixa é quem imprime e aplica a prova, e o aluno precisa saber como marcar ANTES de
 * preencher.
 *
 * ⚠️ AlertDialog controlado, e não ModalTemplate: ele abre por cima do modal da prova
 * (`ShowProva`) sem disputar o foco — o mesmo que o "Enviar este cartão?" já faz.
 */
export function ModalBaixarCartao({
  nomeSimulado,
  aberto,
  onFechar,
  onBaixar,
}: {
  nomeSimulado: string;
  aberto: boolean;
  onFechar: () => void;
  onBaixar: () => void;
}) {
  return (
    <AlertDialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-marine">
            Cartão de resposta
          </AlertDialogTitle>
          <AlertDialogDescription>
            {nomeSimulado}. Passe estas orientações aos alunos antes da prova.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <OrientacoesDoCartao />
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="border border-orange text-orange hover:bg-orange hover:border-orange/20 hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-orange text-white hover:bg-orange/80"
            onClick={onBaixar}
          >
            {TEXTO_BAIXAR_CARTAO}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
