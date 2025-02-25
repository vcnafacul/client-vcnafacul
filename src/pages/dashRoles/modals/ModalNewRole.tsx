import { useState } from "react";
import { toast } from "react-toastify";
import Filter from "../../../components/atoms/filter";
import Text from "../../../components/atoms/text";
import Toggle from "../../../components/atoms/toggle";
import Button from "../../../components/molecules/button";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { CreateRoleDto } from "../../../dtos/roles/createRole";
import { RolesLabel } from "../../../enums/roles/roles";
import { createRole } from "../../../services/roles/createRole";
import { useAuthStore } from "../../../store/auth";
import { Role } from "../../../types/roles/role";

interface ModalNewRoleProps extends ModalProps {
  handleNewRole: (role: Role) => void;
  isOpen: boolean;
}

function ModalNewRole({
  handleNewRole,
  handleClose,
  isOpen,
}: ModalNewRoleProps) {
  const [newRole, setNewRole] = useState<CreateRoleDto>({
    name: "",
    validarCursinho: false,
    alterarPermissao: false,
    criarSimulado: false,
    visualizarQuestao: false,
    criarQuestao: false,
    validarQuestao: false,
    uploadNews: false,
    visualizarProvas: false,
    cadastrarProvas: false,
    visualizarDemanda: false,
    uploadDemanda: false,
    validarDemanda: false,
    gerenciadorDemanda: false,
    gerenciarProcessoSeletivo: false,
    gerenciarColaboradores: false,
    gerenciarTurmas: false,
  });

  const {
    data: { token },
  } = useAuthStore();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewRole({ ...newRole, name: event.target.value.trim().toLowerCase() });
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setNewRole({ ...newRole, [name]: checked });
  };

  const saveNewRole = () => {
    createRole(newRole, token)
      .then((role) => {
        handleNewRole({ name: role.name, id: role.id });
        handleClose!();
        toast.success(`Perfil "${newRole.name}" criado com sucesso!`);
      })
      .catch(() => {
        toast.error(`Erro ao criar o perfil "${newRole.name}".`);
      });
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white rounded-md p-4 "
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 h-fit max-h-[70vh] overflow-y-auto scrollbar-hide">
        {/* Nome do Perfil */}
        <div className="flex flex-col gap-4">
          <Text size="secondary" className="font-bold text-marine">
            Nome do Perfil
          </Text>
          <Filter
            placeholder="Digite o nome do novo perfil"
            filtrar={handleInputChange}
            search={false}
            className="bg-gray-200 rounded-md"
          />
        </div>

        {/* Permissões */}
        <div className="flex flex-col gap-4">
          <Text size="secondary" className="font-bold text-marine">
            Permissões
          </Text>
          <div className="flex flex-col gap-2">
            {RolesLabel.map((role, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-base font-medium text-marine">
                  {role.label}
                </span>
                <Toggle
                  name={role.value}
                  checked={newRole[role.value]}
                  handleCheck={handleToggleChange}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
        <Button
          typeStyle="secondary"
          disabled={!newRole.name.trim()}
          onClick={saveNewRole}
        >
          Salvar
        </Button>
        <Button typeStyle="primary" onClick={handleClose}>
          Cancelar
        </Button>
      </div>
    </ModalTemplate>
  );
}

export default ModalNewRole;
