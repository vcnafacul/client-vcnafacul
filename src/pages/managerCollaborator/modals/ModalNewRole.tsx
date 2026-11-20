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
import { CreateRoleDto } from "../../../dtos/roles/createRole";
import { useAuthStore } from "../../../store/auth";
import Select from "@/components/atoms/select";

interface ModalProps {
  handleClose?: () => void;
}

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
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose!()}>
      {/* tickets/059 D21: era max-w-[44.5rem] (712px), então `lg`. R32: perfil digitado, clicar fora não fecha. */}
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Novo Perfil</DialogTitle>
          <DialogDescription>
            Defina o nome, perfil base e as permissões do novo perfil.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
        {/* Name + base role */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="novo-perfil-nome" className="flex flex-col gap-1 flex-1">
            <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
              Nome do perfil
            </span>
            <Filter
              id="novo-perfil-nome"
              placeholder="Ex: coordenador"
              filtrar={handleInputChange}
              search={false}
              className="bg-muted rounded-lg"
            />
          </label>
          <label htmlFor="novo-perfil-base" className="flex flex-col gap-1 flex-1">
            <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
              Perfil base
            </span>
            <div className="my-2">
              <Select
                id="novo-perfil-base"
                options={baseRoles.map((role) => ({
                  id: role.id,
                  name: role.name,
                }))}
                value={baseRoleSelected?.id}
                setState={(value) =>
                  setBaseRoleSelected(
                    baseRoles.find((r) => String(r.id) === String(value))!,
                  )
                }
              />
            </div>
          </label>
        </div>

        {/* Permissions */}
        <div className="pr-1">
          <PermissionHierarchyPanel
            hierarchy={hierarchy}
            permissions={newRole}
            baseRoleMap={baseRoleMap}
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
