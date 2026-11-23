import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PermissionType } from "@/dtos/roles/permissionHierarchy";
import PermissaoSwitch from "@/components/permissoes/PermissaoSwitch";
import { Field } from "@/components/ui/field";
import { OptionsSelect } from "@/components/ui/options-select";
import { Button } from "@/components/ui/button";
import { getRoleNew } from "../../../services/roles/getRole";
import { useAuthStore } from "../../../store/auth";
import { Role } from "../../../types/roles/role";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { PermissionGroupResponse } from "@/dtos/roles/permission";

interface ModalRoleProps {
  roles: Role[];
  role: Role;
  updateUserRole: (roleId: string) => void;
  handleClose: () => void;
  isOpen: boolean;
}

function PermissionReadonlyList({
  groups,
}: {
  groups: PermissionGroupResponse[];
}) {
  if (!groups || groups.length === 0) {
    return (
      <p className="text-body text-muted-foreground text-center py-4">
        Nenhuma permissão encontrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div
          key={group.key}
          className="rounded-xl border border-border bg-page/50 p-4 flex flex-col gap-3"
        >
          <span className="text-body font-semibold text-foreground">
            {group.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {group.permissions.map((node) => (
              <PermissaoSwitch
                key={node.key}
                label={node.label}
                checked={node.value}
                readonly
                type={node.type as PermissionType}
                mostrarTipo
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalUpdateRoleUser({
  roles,
  role,
  updateUserRole,
  isOpen,
  handleClose,
}: ModalRoleProps) {
  const [roleInfo, setRoleInfo] = useState<
    PermissionGroupResponse[] | undefined
  >(undefined);

  const [newRole, setNewRole] = useState(role.id);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setNewRole(role.id);
      setIsEditing(false);
    }
  }, [isOpen, role.id]);

  useEffect(() => {
    if (!newRole) return;

    let cancelled = false;

    setRoleInfo(undefined);

    getRoleNew(newRole, token)
      .then((data) => {
        if (!cancelled) {
          setRoleInfo(data);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          toast.error(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [newRole, token]);

  const updateRole = () => {
    updateUserRole(newRole);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setNewRole(role.id);
    setIsEditing(false);
  };

  const selectedRoleName =
    roles.find((r) => r.id === newRole)?.name ?? role.name;

  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose()}>
      {/* tickets/059 D21: era max-w-[44.5rem] (712px), então `lg`. R32: perfil em edição, clicar fora não fecha. */}
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Permissões do Usuário</DialogTitle>
          <DialogDescription>
            Visualize ou altere o perfil atribuído a este usuário.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
        {/* Role selector */}
        {isEditing ? (
          <Field label="Perfil">
            <OptionsSelect<string>
              options={roles.map((r) => ({ value: String(r.id), label: r.name }))}
              value={newRole}
              onValueChange={setNewRole}
            />
          </Field>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-foreground">Perfil</span>
            <div className="text-body font-semibold text-foreground px-3 py-2 rounded-lg border border-border bg-page">
              {selectedRoleName}
            </div>
          </div>
        )}

        {/* Permissions */}
        <div className="pr-1">
          {roleInfo ? (
            <PermissionReadonlyList groups={roleInfo} />
          ) : (
            <p className="text-body text-muted-foreground text-center py-4">
              Carregando...
            </p>
          )}
        </div>

        </DialogBody>
        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={updateRole}
                disabled={newRole === role.id}
              >
                Salvar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={roles.length === 0}
            >
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalUpdateRoleUser;
