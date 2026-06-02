import PermissionHierarchyPanel from "@/components/organisms/permissionHierarchyPanel/PermissionHierarchyPanel";
import Toggle from "@/components/atoms/toggle";
import { EditRoleDto } from "@/dtos/roles/editRole";
import {
  PermissionGroup,
  PermissionType,
} from "@/dtos/roles/permissionHierarchy";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getAllRoles } from "@/services/roles/getAll";
import { updateRole } from "@/services/roles/updateRole";
import { getPermissionsHierarchy } from "@/services/roles/getPermissionsHierarchy";
import { useEffect, useState } from "react";
import Button from "../../../components/molecules/button";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { useAuthStore } from "../../../store/auth";
import Text from "../../../components/atoms/text";
import Select from "@/components/atoms/select";

interface ModalEditRoleProps extends ModalProps {
  isOpen: boolean;
}

function applyBaseRoleConstraints(
  role: EditRoleDto,
  hierarchy: PermissionGroup[],
): EditRoleDto {
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

function ModalEditRole({ handleClose, isOpen }: ModalEditRoleProps) {
  const [roles, setRoles] = useState<EditRoleDto[]>([]);
  const [roleSelected, setRoleSelected] = useState<EditRoleDto | null>(null);
  const [hierarchy, setHierarchy] = useState<PermissionGroup[]>([]);

  const executeAsync = useToastAsync();
  const {
    data: { token },
  } = useAuthStore();

  const handleToggle = (key: string, val: boolean) => {
    setRoleSelected((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const handleBaseToggle = (_: string, checked: boolean) => {
    setRoleSelected((prev) => {
      if (!prev) return prev;
      return applyBaseRoleConstraints({ ...prev, base: checked }, hierarchy);
    });
  };

  const editRole = async () => {
    if (!roleSelected) return;
    await executeAsync({
      action: () => updateRole(token, roleSelected),
      loadingMessage: "Atualizando perfil...",
      successMessage: "Perfil atualizado com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => handleClose!(),
    });
  };

  useEffect(() => {
    getAllRoles(token).then((roles) => {
      if (roles.length > 0) setRoleSelected(roles[0]);
      setRoles(roles);
    });
    getPermissionsHierarchy(token)
      .then(setHierarchy)
      .catch(() => {});
  }, []);

  const visibleHierarchy: PermissionGroup[] = roleSelected?.base
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
            Editar Perfil
          </Text>
          <p className="text-sm text-gray-400 mt-0.5">
            Selecione um perfil e ajuste suas permissões.
          </p>
        </div>

        {/* Role selector + base toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Perfil
            </span>
            <Select
              options={roles.map((role) => ({
                id: role.id,
                name: role.name,
              }))}
              value={roleSelected?.id}
              setState={(value) =>
                setRoleSelected(
                  roles.find((r) => String(r.id) === String(value))!,
                )
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Perfil Base
            </span>
            <div className="flex items-center gap-3 h-full py-2">
              <Toggle
                name="base"
                checked={roleSelected?.base ?? false}
                handleCheck={handleBaseToggle}
              />
              <span className="text-sm font-medium text-marine">
                {roleSelected?.base ? "Ativo" : "Inativo"}
              </span>
            </div>
          </label>
        </div>

        {roleSelected?.base && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Perfis base só podem ter permissões do projeto. Permissões do
            cursinho e "Alterar Permissão" são desativadas automaticamente.
          </p>
        )}

        {/* Permissions */}
        <div className="overflow-y-auto scrollbar-hide pr-1">
          <PermissionHierarchyPanel
            hierarchy={visibleHierarchy}
            permissions={roleSelected ?? ({} as EditRoleDto)}
            onToggle={handleToggle}
            defaultTab={
              roleSelected?.base
                ? PermissionType.project
                : PermissionType.prepCourse
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
            disabled={!roleSelected?.name.trim()}
            onClick={editRole}
          >
            Salvar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ModalEditRole;
