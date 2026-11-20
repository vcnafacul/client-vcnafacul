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
import { Button } from "@/components/ui/button";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  gerenciarCategoriasCursinho: false,
  excluirQuestao: false,
  enviarNotificacao: false,
  visualizarQuestoesCursinho: false,
  editarQuestoesCursinho: false,
  validarQuestoesCursinho: false,
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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Novo Perfil</DialogTitle>
          <DialogDescription>
            Defina o nome e as permissões do novo perfil.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          {/* Name + base toggle */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-7">
            {/* O controle está dentro do label (componente próprio): a associação é por aninhamento. */}
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
                Nome do perfil
              </span>
              <Filter
                placeholder="Digite o nome do novo perfil"
                filtrar={handleInputChange}
                search={false}
                className="bg-muted rounded-lg"
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
                  checked={newRole.base}
                  handleCheck={handleBaseToggle}
                />
                <span className="text-body font-medium text-foreground">
                  {newRole.base ? "Ativo" : "Inativo"}
                </span>
              </div>
            </label>
          </div>

          {newRole.base && (
            <p className="text-caption text-warning bg-warning-muted border border-warning/30 rounded-lg px-3 py-2">
              Perfis base só podem ter permissões do projeto. Permissões do
              cursinho e "Alterar Permissão" são desativadas automaticamente.
            </p>
          )}

          {/* Permissions */}
          <div>
            <PermissionHierarchyPanel
              hierarchy={visibleHierarchy}
              permissions={newRole}
              onToggle={handleToggle}
              defaultTab={
                newRole.base
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
            disabled={!newRole.name.trim()}
            onClick={saveNewRole}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalNewRole;
