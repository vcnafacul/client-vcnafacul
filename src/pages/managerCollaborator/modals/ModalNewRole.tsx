import { PermissionsList } from "@/components/atoms/permissionList";
import { EditRoleDto } from "@/dtos/roles/editRole";
import { createRole } from "@/services/prepCourse/createRole";
import { getBaseRoles } from "@/services/prepCourse/getBaseRole";
import { Role } from "@/types/roles/role";
import { useEffect, useState } from "react";
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

interface ModalNewRoleProps extends ModalProps {
  isOpen: boolean;
  handleNewRole: (role: Role) => void;
}

function ModalNewRole({
  handleClose,
  isOpen,
  handleNewRole,
}: ModalNewRoleProps) {
  const [baseRoles, setBaseRoles] = useState<EditRoleDto[]>([]);
  const [baseRoleSelected, setBaseRoleSelected] = useState<EditRoleDto | null>(
    null
  );
  const [newRole, setNewRole] = useState<CreateRoleDto>({
    name: "",
    base: false,
    roleBase: "",
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
    visualizarTurmas: false,
    gerenciarEstudantes: false,
    visualizarEstudantes: false,
    gerenciarPermissoesCursinho: false,
    visualizarMinhasInscricoes: false,
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
    createRole({ ...newRole, roleBase: baseRoleSelected?.id }, token)
      .then((res) => {
        handleNewRole({ id: res.id, name: res.name } as Role);
        handleClose!();
        toast.success(`Perfil "${newRole.name}" criado com sucesso!`);
      })
      .catch(() => {
        toast.error(`Erro ao criar o perfil "${newRole.name}".`);
      });
  };

  useEffect(() => {
    getBaseRoles(token)
      .then((res) => {
        if (res.length > 0) {
          setBaseRoleSelected(res[0]);
        }
        setBaseRoles(res);
      })
      .catch(() => {
        toast.error("Erro ao buscar os perfis base");
      });
  }, []);

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
          </div>
          <select
            className="remove-arrow w-full h-full text-lg font-black text-marine pl-4 pr-10 py-1 rounded-xl shadow-md z-50"
            id="demo-simple-select"
            value={baseRoleSelected?.id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setBaseRoleSelected(
                baseRoles.find((item) => item.id === e.target.value)!
              );
            }}
          >
            {baseRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Permissões */}
        <PermissionsList
          title="Permissões do Projeto"
          roles={RolesLabel.filter((role) => role.isProjectPermission)}
          seletedRole={baseRoleSelected}
          handleToggleChange={handleToggleChange}
          disabled
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
        <Button typeStyle="primary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          typeStyle="secondary"
          disabled={!newRole.name.trim()}
          onClick={saveNewRole}
        >
          Salvar
        </Button>
      </div>
    </ModalTemplate>
  );
}

export default ModalNewRole;
