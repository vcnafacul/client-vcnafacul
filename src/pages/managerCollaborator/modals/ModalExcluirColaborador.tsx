import Select from "@/components/atoms/select";
import Button from "@/components/molecules/button";
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
        <h2 className="text-lg font-bold text-marine">Excluir {nome}?</h2>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Sai da lista de colaboradores e vai para Ex-membros.</li>
          <li>Perde o acesso ao cursinho e sai das turmas que administra.</li>
          <li>
            Diferente de inativar: só volta com um convite novo.
          </li>
        </ul>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Perfil depois da saída
          </span>
          <Select
            options={[
              { id: SO_ALUNO, name: "Só aluno (sem permissões)" },
              ...perfis.map((p) => ({ id: p.id, name: p.name })),
            ]}
            value={perfil}
            setState={(v) => setPerfil(String(v))}
          />
          <span className="text-xs text-gray-500">
            Os perfis da lista são recomendados pelo projeto para quem continua
            ajudando em outras frentes.
          </span>
        </label>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button typeStyle="primary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button typeStyle="refused" onClick={confirmar} disabled={excluindo}>
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
