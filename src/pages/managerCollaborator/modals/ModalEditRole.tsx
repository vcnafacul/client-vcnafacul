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
import { Button } from "@/components/ui/button";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { useAuthStore } from "../../../store/auth";
import Text from "../../../components/atoms/text";
import Select from "@/components/atoms/select";

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
      className="bg-white rounded-xl p-4 sm:p-5 w-full max-w-[44.5rem]"
    >
      <div className="w-full flex flex-col gap-5 max-h-[80vh]">
        {/* Header */}
        <div>
          <Text size="secondary" className="font-bold text-foreground">
            Editar Perfil
          </Text>
          <p className="text-body text-muted-foreground mt-0.5">
            Selecione um perfil e ajuste suas permissões.
          </p>
        </div>

        {/* Role selector */}
        <label className="flex flex-col gap-1">
          <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
            Perfil
          </span>

          <Select
            options={roles.map((role) => ({
              id: role.id,
              name: role.name,
            }))}
            defaultValue={roleSelected?.id}
            setState={(value) =>
              setRoleSelected(
                roles.find((r) => String(r.id) === String(value))!,
              )
            }
          />
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
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button className="w-full" variant="outline" size="lg" onClick={handleClose}>
            Cancelar
          </Button>
          <Button className="w-full" variant="primary" size="lg"
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
