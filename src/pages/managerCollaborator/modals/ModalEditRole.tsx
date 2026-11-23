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
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "../../../store/auth";
import { Field } from "@/components/ui/field";
import { OptionsSelect } from "@/components/ui/options-select";

interface ModalProps {
  handleClose?: () => void;
}

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
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose!()}>
      {/* tickets/059 D21: era max-w-[44.5rem] (712px), então `lg`. R32: perfil em edição, clicar fora não fecha. */}
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Selecione um perfil e ajuste suas permissões.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
        {/* Role selector */}
        <Field label="Perfil">
          <OptionsSelect<string>
            id="editar-perfil"
            options={roles.map((role) => ({
              value: String(role.id),
              label: role.name,
            }))}
            value={roleSelected ? String(roleSelected.id) : undefined}
            onValueChange={(value) =>
              setRoleSelected(roles.find((r) => String(r.id) === value) ?? null)
            }
          />
        </Field>

        {/* Permissions */}
        <div className="pr-1">
          <PermissionHierarchyPanel
            hierarchy={hierarchy}
            permissions={roleSelected ?? ({} as EditRoleDto)}
            onToggle={handleToggle}
            disabledTypes={[PermissionType.project]}
          />
        </div>

        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!roleSelected?.name.trim()}
            onClick={editRole}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalEditRole;
