import PermissionHierarchyPanel from "@/components/organisms/permissionHierarchyPanel/PermissionHierarchyPanel";
import { EditRoleDto } from "@/dtos/roles/editRole";
import {
  PermissionGroup,
  PermissionType,
} from "@/dtos/roles/permissionHierarchy";
import { createRole } from "@/services/prepCourse/createRole";
import { getBaseRoles } from "@/services/prepCourse/getBaseRole";
import { getPermissionsHierarchy } from "@/services/roles/getPermissionsHierarchy";
import { Role } from "@/types/roles/role";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Filter from "../../../components/atoms/filter";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { CreateRoleDto } from "../../../dtos/roles/createRole";
import { useAuthStore } from "../../../store/auth";

interface ModalNewRoleProps extends ModalProps {
  isOpen: boolean;
  handleNewRole: (role: Role) => void;
}

const EMPTY_ROLE: CreateRoleDto = {
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
  gerenciarFormularioGlobal: false,
  gerenciarFormulario: false,
  gerenciarTemas: false,
  revisarRedacoes: false,
  revisarTodasRedacoes: false,
  supportAgent: false,
  partnerPrepSupportAgent: false,
};

function ModalNewRole({
  handleClose,
  isOpen,
  handleNewRole,
}: ModalNewRoleProps) {
  const [baseRoles, setBaseRoles] = useState<EditRoleDto[]>([]);
  const [baseRoleSelected, setBaseRoleSelected] = useState<EditRoleDto | null>(
    null,
  );
  const [hierarchy, setHierarchy] = useState<PermissionGroup[]>([]);
  const [newRole, setNewRole] = useState<CreateRoleDto>(EMPTY_ROLE);

  const {
    data: { token },
  } = useAuthStore();

  const baseRoleMap = useMemo<Record<string, boolean>>(() => {
    if (!baseRoleSelected) return {};
    const map: Record<string, boolean> = {};
    for (const key of Object.keys(baseRoleSelected) as (keyof EditRoleDto)[]) {
      if (
        key !== "id" &&
        key !== "name" &&
        key !== "base" &&
        key !== "roleBase"
      ) {
        if (baseRoleSelected[key] === true) map[key as string] = true;
      }
    }
    return map;
  }, [baseRoleSelected]);

  const handleToggle = (key: string, val: boolean) => {
    setNewRole((prev) => ({ ...prev, [key]: val }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewRole((prev) => ({
      ...prev,
      name: event.target.value.trim().toLowerCase(),
    }));
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
        if (res.length > 0) setBaseRoleSelected(res[0]);
        setBaseRoles(res);
      })
      .catch(() => toast.error("Erro ao buscar os perfis base"));

    getPermissionsHierarchy(token)
      .then(setHierarchy)
      .catch(() => toast.error("Erro ao buscar hierarquia de permissões"));
  }, []);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white rounded-xl p-5"
    >
      <div className="w-[92vw] max-w-2xl flex flex-col gap-5 max-h-[80vh]">
        {/* Header */}
        <div>
          <Text size="secondary" className="font-bold text-marine">
            Novo Perfil
          </Text>
          <p className="text-sm text-gray-400 mt-0.5">
            Defina o nome, perfil base e as permissões do novo perfil.
          </p>
        </div>

        {/* Name + base role */}
        <div className="flex gap-3">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nome do perfil
            </span>
            <Filter
              placeholder="Ex: coordenador"
              filtrar={handleInputChange}
              search={false}
              className="bg-gray-100 rounded-lg"
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Perfil base
            </span>
            <select
              className="remove-arrow text-sm font-semibold text-marine m-4 px-3 py-2 rounded-lg shadow-sm border border-gray-200 bg-white z-50"
              value={baseRoleSelected?.id}
              onChange={(e) =>
                setBaseRoleSelected(
                  baseRoles.find((r) => r.id === e.target.value)!,
                )
              }
            >
              {baseRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Permissions */}
        <div className="overflow-y-auto scrollbar-hide pr-1">
          <PermissionHierarchyPanel
            hierarchy={hierarchy}
            permissions={newRole}
            baseRoleMap={baseRoleMap}
            onToggle={handleToggle}
            disabledTypes={[PermissionType.project]}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
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
      </div>
    </ModalTemplate>
  );
}

export default ModalNewRole;
