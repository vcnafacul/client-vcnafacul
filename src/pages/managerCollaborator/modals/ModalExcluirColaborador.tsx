import Select from "@/components/atoms/select";
import { Button } from "@/components/ui/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import {
  getRecommendedRoles,
  PerfilRecomendado,
} from "@/services/roles/getRecommended";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

/** Valor do seletor que quer dizer "sem perfil: só aluno". */
export const SO_ALUNO = "";

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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white rounded-xl p-4 sm:p-5 w-[calc(100%-2rem)] max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-h3 font-bold text-foreground">Excluir {nome}?</h2>
        <ul className="list-disc pl-5 text-body text-muted-foreground space-y-1">
          <li>Sai da lista de colaboradores e vai para Ex-membros.</li>
          <li>Perde o acesso ao cursinho e sai das turmas que administra.</li>
          <li>
            Diferente de inativar: só volta com um convite novo.
          </li>
        </ul>
        <label className="flex flex-col gap-1">
          <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
            Perfil depois da saída
          </span>
          <Select
            options={[
              { id: SO_ALUNO, name: "Não recomendo permissões" },
              ...perfis.map((p) => ({ id: p.id, name: p.name })),
            ]}
            value={perfil}
            setState={(v) => setPerfil(String(v))}
          />
          <span className="text-caption text-muted-foreground">
            Os perfis da lista são recomendados pelo projeto para quem continua
            ajudando em outras frentes.
          </span>
        </label>
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button className="w-full" variant="outline" size="lg" onClick={handleClose}>
            Cancelar
          </Button>
          <Button className="w-full" variant="destructive" size="lg" onClick={confirmar} disabled={excluindo}>
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
