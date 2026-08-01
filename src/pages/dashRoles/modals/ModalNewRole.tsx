import PermissionHierarchyPanel from "@/components/organisms/permissionHierarchyPanel/PermissionHierarchyPanel";
import Toggle from "@/components/atoms/toggle";
import {
  PermissionGroup,
  PermissionType,
} from "@/dtos/roles/permissionHierarchy";
import { createRole } from "@/services/roles/createRole";
import { getPermissionsHierarchy } from "@/services/roles/getPermissionsHierarchy";
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
import { useAuthStore } from "../../../store/auth";

interface ModalNewRoleProps extends ModalProps {
  handleNewRole: (role: Role) => void;
  isOpen: boolean;
}

const EMPTY_ROLE: CreateRoleDto = {
  name: "",
  base: false,
  validarCursinho: false,
  alterarPermissao: false,
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
  editarMateriasFrentes: false,
  visualizarProvasCursinho: false,
  cadastrarProvasCursinho: false,
};

function applyBaseRoleConstraints(
  role: CreateRoleDto,
  hierarchy: PermissionGroup[],
): CreateRoleDto {
  if (!role.base) return role;
  const prepCourseKeys = new Set<string>();
  for (const group of hierarchy) {
    for (const node of group.permissions) {
      if (node.type === PermissionType.prepCourse) {
        prepCourseKeys.add(
          node.key.replace(/_([a-z])/g, (_: string, l: string) =>
            l.toUpperCase(),
          ),
        );
      }
    }
  }
  prepCourseKeys.add("alterarPermissao");
  prepCourseKeys.add("gerenciarPermissoesCursinho");
  const patched = { ...role };
  for (const key of prepCourseKeys) (patched as any)[key] = false;
  return patched;
}

function ModalNewRole({
  handleNewRole,
  handleClose,
  isOpen,
}: ModalNewRoleProps) {
  const [newRole, setNewRole] = useState<CreateRoleDto>(EMPTY_ROLE);
  const [hierarchy, setHierarchy] = useState<PermissionGroup[]>([]);

  const {
    data: { token },
  } = useAuthStore();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewRole((prev) => ({
      ...prev,
      name: event.target.value.trim().toLowerCase(),
    }));
  };

  const handleBaseToggle = (_: string, checked: boolean) => {
    setNewRole((prev) =>
      applyBaseRoleConstraints({ ...prev, base: checked }, hierarchy),
    );
  };

  const handleToggle = (key: string, val: boolean) => {
    setNewRole((prev) => ({ ...prev, [key]: val }));
  };

  const saveNewRole = () => {
    createRole(newRole, token)
      .then((role) => {
        handleNewRole({ name: role.name, id: role.id });
        handleClose!();
        toast.success(`Perfil "${newRole.name}" criado com sucesso!`);
      })
      .catch(() => toast.error(`Erro ao criar o perfil "${newRole.name}".`));
  };

  useEffect(() => {
    getPermissionsHierarchy(token)
      .then(setHierarchy)
      .catch(() => toast.error("Erro ao buscar hierarquia de permissões"));
  }, []);

  const visibleHierarchy: PermissionGroup[] = newRole.base
    ? hierarchy
        .map((group) => ({
          ...group,
          permissions: group.permissions.filter(
            (n) =>
              n.type === PermissionType.project &&
              n.key !== "alterar_permissao",
          ),
        }))
        .filter((group) => group.permissions.length > 0)
    : hierarchy;

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
            Defina o nome e as permissões do novo perfil.
          </p>
        </div>

        {/* Name + base toggle */}
        <div className="flex gap-7">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nome do perfil
            </span>
            <Filter
              placeholder="Digite o nome do novo perfil"
              filtrar={handleInputChange}
              search={false}
              className="bg-gray-100 rounded-lg"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Perfil Base
            </span>
            <div className="flex items-center gap-3 h-full py-2">
              <Toggle
                name="base"
                checked={newRole.base}
                handleCheck={handleBaseToggle}
              />
              <span className="text-sm font-medium text-marine">
                {newRole.base ? "Ativo" : "Inativo"}
              </span>
            </div>
          </label>
        </div>

        {newRole.base && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Perfis base só podem ter permissões do projeto. Permissões do
            cursinho e "Alterar Permissão" são desativadas automaticamente.
          </p>
        )}

        {/* Permissions */}
        <div className="overflow-y-auto scrollbar-hide pr-1">
          <PermissionHierarchyPanel
            hierarchy={visibleHierarchy}
            permissions={newRole}
            onToggle={handleToggle}
            defaultTab={
              newRole.base ? PermissionType.project : PermissionType.prepCourse
            }
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
