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
import { setRoleRecommended } from "@/services/roles/setRoleRecommended";
import { motivoSemRecomendacao, passosDoSalvar } from "./recomendacao";
import { getPermissionsHierarchy } from "@/services/roles/getPermissionsHierarchy";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalProps } from "../../../components/templates/modalTemplate";
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
    setRoleSelected((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: val };
      // Perfil recomendado não pode ter "Alterar Permissão" (ver recomendacao.ts).
      return motivoSemRecomendacao(next)
        ? { ...next, isRecommended: false }
        : next;
    });
  };

  const handleRecommendedToggle = (_: string, checked: boolean) => {
    setRoleSelected((prev) =>
      prev ? { ...prev, isRecommended: checked } : prev,
    );
  };

  const handleBaseToggle = (_: string, checked: boolean) => {
    setRoleSelected((prev) => {
      if (!prev) return prev;
      const next = applyBaseRoleConstraints(
        { ...prev, base: checked },
        hierarchy,
      );
      return motivoSemRecomendacao(next)
        ? { ...next, isRecommended: false }
        : next;
    });
  };

  const editRole = async () => {
    if (!roleSelected) return;
    const antes =
      roles.find((r) => r.id === roleSelected.id)?.isRecommended ?? false;
    const passos = passosDoSalvar(antes, roleSelected.isRecommended ?? false);
    await executeAsync({
      action: async () => {
        for (const passo of passos) {
          if (passo === "perfil") await updateRole(token, roleSelected);
          else
            await setRoleRecommended(
              token,
              roleSelected.id,
              passo === "recomendar",
            );
        }
      },
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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Selecione um perfil e ajuste suas permissões.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          {/* Role selector + base toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* O controle está dentro do label (componente próprio): a associação é por aninhamento. */}
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
                Perfil
              </span>
              <Select
                options={roles.map((role) => ({
                  id: role.id,
                  name: role.isRecommended
                    ? `${role.name} · recomendado`
                    : role.name,
                }))}
                value={roleSelected?.id}
                setState={(value) =>
                  setRoleSelected(
                    roles.find((r) => String(r.id) === String(value))!,
                  )
                }
              />
            </label>
            {/* O controle está dentro do label (componente próprio): a associação é por aninhamento. */}
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="flex flex-col gap-1">
              <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
                Perfil Base
              </span>
              <div className="flex items-center gap-3 h-full py-2">
                <Toggle
                  name="base"
                  checked={roleSelected?.base ?? false}
                  handleCheck={handleBaseToggle}
                />
                <span className="text-body font-medium text-foreground">
                  {roleSelected?.base ? "Ativo" : "Inativo"}
                </span>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-3">
              <Toggle
                name="isRecommended"
                checked={roleSelected?.isRecommended ?? false}
                handleCheck={handleRecommendedToggle}
                disabled={
                  !roleSelected || !!motivoSemRecomendacao(roleSelected)
                }
              />
              <span className="text-body font-medium text-foreground">
                Recomendado para ex-colaboradores
              </span>
            </div>
            <p className="text-caption text-muted-foreground">
              {(roleSelected && motivoSemRecomendacao(roleSelected)) ??
                "Coordenadores poderão indicar este perfil ao excluir um colaborador do cursinho."}
            </p>
          </div>

          {roleSelected?.base && (
            <p className="text-caption text-warning bg-warning-muted border border-warning/30 rounded-lg px-3 py-2">
              Perfis base só podem ter permissões do projeto. Permissões do
              cursinho e "Alterar Permissão" são desativadas automaticamente.
            </p>
          )}

          {/* Permissions */}
          <div>
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
