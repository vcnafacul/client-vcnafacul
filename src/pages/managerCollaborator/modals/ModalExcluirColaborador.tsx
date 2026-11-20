import { Field } from "@/components/ui/field";
import { OptionsSelect } from "@/components/ui/options-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getRecommendedRoles,
  PerfilRecomendado,
} from "@/services/roles/getRecommended";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

/** Valor do seletor que quer dizer "sem perfil: só aluno". */
export const SO_ALUNO = "";
// O Radix não aceita item de valor vazio: a opção "só aluno" usa este valor por dentro.
const VALOR_SO_ALUNO = "__so_aluno__";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  nome: string;
  /** `roleId` vazio = só aluno. `true` = deu certo. */
  handleExcluir: (roleId?: string) => Promise<boolean>;
}

/**
 * Excluir colaborador (tickets/040, card 06). Diferente de inativar: a pessoa
 * sai da lista, vai para Ex-membros e só volta por convite novo.
 */
export function ModalExcluirColaborador({
  isOpen,
  handleClose,
  nome,
  handleExcluir,
}: Props) {
  const {
    data: { token },
  } = useAuthStore();
  const [perfis, setPerfis] = useState<PerfilRecomendado[]>([]);
  const [perfil, setPerfil] = useState<string>(SO_ALUNO);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    // Sem a lista, ainda dá para excluir como aluno.
    getRecommendedRoles(token)
      .then(setPerfis)
      .catch(() => setPerfis([]));
  }, [token]);

  const confirmar = async () => {
    setExcluindo(true);
    const ok = await handleExcluir(perfil || undefined);
    setExcluindo(false);
    if (ok) handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose()}>
      {/* tickets/059 D21: era max-w-lg (512px), então `md`. R32: tem seletor de perfil, clicar fora não fecha. */}
      <DialogContent
        size="md"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Excluir {nome}?</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <ul className="list-disc pl-5 text-body text-muted-foreground space-y-1">
            <li>Sai da lista de colaboradores e vai para Ex-membros.</li>
            <li>Perde o acesso ao cursinho e sai das turmas que administra.</li>
            <li>Diferente de inativar: só volta com um convite novo.</li>
          </ul>
          <Field
            label="Perfil depois da saída"
            hint="Os perfis da lista são recomendados pelo projeto para quem continua ajudando em outras frentes."
          >
            <OptionsSelect<string>
              id="perfil-depois-da-saida"
              options={[
                { value: VALOR_SO_ALUNO, label: "Não recomendo permissões" },
                ...perfis.map((p) => ({ value: String(p.id), label: p.name })),
              ]}
              value={perfil || VALOR_SO_ALUNO}
              onValueChange={(v) => setPerfil(v === VALOR_SO_ALUNO ? SO_ALUNO : v)}
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmar} disabled={excluindo}>
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
