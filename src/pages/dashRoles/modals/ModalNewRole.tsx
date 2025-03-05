import { PermissionsList } from "@/components/atoms/permissionList";
import Toggle from "@/components/atoms/toggle";
import { createRole } from "@/services/roles/createRole";
import { useState } from "react";
import { toast } from "react-toastify";
import Filter from "../../../components/atoms/filter";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { CreateRoleDto } from "../../../dtos/roles/createRole";
import { RolesLabel } from "../../../enums/roles/roles";
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
    base: false,
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
    gerenciarEstudantes: false,
    gerenciarPermissoesCursinho: false,
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
      className="bg-white rounded-md p-4"
    >
      <div className="w-[90vw] h-fit max-h-[70vh] overflow-y-auto scrollbar-hide">
        {/* Nome do Perfil */}
        <div className="flex flex-col gap-4">
          <Text size="secondary" className="font-bold text-marine">
            Nome do Perfil
          </Text>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap w-full">
            <Filter
              placeholder="Digite o nome do novo perfil"
              filtrar={handleInputChange}
              search={false}
              className="bg-gray-200 rounded-md w-full sm:flex-1"
            />
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Toggle
                name="base"
                checked={newRole["base"]}
                handleCheck={handleToggleChange}
              />
              <span className="text-base font-medium text-marine">
                Perfil Base
              </span>
            </div>
          </div>
        </div>

        {/* Permissões */}
        <PermissionsList
          title="Permissões do Projeto"
          roles={RolesLabel.filter((role) => role.isProjectPermission)}
          seletedRole={newRole}
          handleToggleChange={handleToggleChange}
        />
        <div className="border-b border-gray-200 pt-3 mb-3" />
        <PermissionsList
          title="Permissões do Cursinho"
          roles={RolesLabel.filter((role) => !role.isProjectPermission)}
          seletedRole={newRole}
          handleToggleChange={handleToggleChange}
        />
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
