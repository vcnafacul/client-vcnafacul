import PermissionHierarchyPanel from "@/components/organisms/permissionHierarchyPanel/PermissionHierarchyPanel";
import { EditRoleDto } from "@/dtos/roles/editRole";
import {
  PermissionGroup,
  PermissionType,
} from "@/dtos/roles/permissionHierarchy";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getRoles } from "@/services/prepCourse/getRoles";
import { updateRole } from "@/services/prepCourse/updateRole";
import { getPermissionsHierarchy } from "@/services/roles/getPermissionsHierarchy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/molecules/button";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { useAuthStore } from "../../../store/auth";
import Text from "../../../components/atoms/text";

interface ModalEditRoleProps extends ModalProps {
  isOpen: boolean;
}

function ModalEditRole({ handleClose, isOpen }: ModalEditRoleProps) {
  const [roles, setRoles] = useState<EditRoleDto[]>([]);
  const [roleSelected, setRoleSelected] = useState<EditRoleDto | null>(null);
  const [hierarchy, setHierarchy] = useState<PermissionGroup[]>([]);

  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const handleToggle = (key: string, val: boolean) => {
    setRoleSelected((prev) => (prev ? { ...prev, [key]: val } : prev));
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
    getRoles(token)
      .then((roles) => {
        if (roles.length > 0) {
          setRoles(roles);
          setRoleSelected(roles[0]);
        } else {
          toast.info("Não há perfis cadastrados!");
        }
      })
      .catch(() => {
        toast.error("Erro ao carregar perfis!");
        handleClose!();
      });

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
            Editar Perfil
          </Text>
          <p className="text-sm text-gray-400 mt-0.5">
            Selecione um perfil e ajuste suas permissões.
          </p>
        </div>

        {/* Role selector */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Perfil
          </span>
          <select
            className="remove-arrow text-sm font-semibold text-marine px-3 py-2 rounded-lg shadow-sm border border-gray-200 bg-white z-50 w-full"
            value={roleSelected?.id}
            onChange={(e) =>
              setRoleSelected(roles.find((r) => r.id === e.target.value)!)
            }
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>

        {/* Permissions */}
        <div className="overflow-y-auto scrollbar-hide pr-1">
          <PermissionHierarchyPanel
            hierarchy={hierarchy}
            permissions={roleSelected ?? ({} as EditRoleDto)}
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
