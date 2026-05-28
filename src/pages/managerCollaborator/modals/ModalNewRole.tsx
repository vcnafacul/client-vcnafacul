import { EditRoleDto } from "@/dtos/roles/editRole";
import {
  PermissionGroup,
  PermissionType,
} from "@/dtos/roles/permissionHierarchy";
import { createRole } from "@/services/prepCourse/createRole";
import { getBaseRoles } from "@/services/prepCourse/getBaseRole";
import { getPermissionsHierarchy } from "@/services/roles/getPermissionsHierarchy";
import { toCamelPermission } from "@/utils/permissionKey";
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

function computeImplied(
  permissions: CreateRoleDto,
  hierarchy: PermissionGroup[],
): Record<string, boolean> {
  const implied: Record<string, boolean> = {};
  for (const group of hierarchy) {
    for (const node of group.permissions) {
      const camelKey = toCamelPermission(node.key);
      if (permissions[camelKey as keyof CreateRoleDto] && node.implies) {
        for (const imp of node.implies) {
          implied[toCamelPermission(imp)] = true;
        }
      }
    }
  }
  return implied;
}

function PermissionToggle({
  label,
  checked,
  implied,
  onChange,
  disabled,
  type,
}: {
  label: string;
  checked: boolean;
  implied: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  type: PermissionType;
}) {
  const isOn = checked || implied;
  const isReadonly = implied || disabled;
  const isPrepCourse = type === PermissionType.prepCourse;

  const COLOR = {
    solid: isPrepCourse ? "#f97316" : "#3b82f6", // orange-500 / blue-500
    solidLight: isPrepCourse ? "#ffedd5" : "#dbeafe", // orange-100 / blue-100
    solidBorder: isPrepCourse ? "#fdba74" : "#93c5fd", // orange-300 / blue-300
    solidText: isPrepCourse ? "#fb923c" : "#60a5fa", // orange-400 / blue-400
    dot: isPrepCourse ? "#fdba74" : "#93c5fd", // orange-300 / blue-300
  };

  const buttonStyle: React.CSSProperties = isOn
    ? implied
      ? {
          background: COLOR.solidLight,
          borderColor: COLOR.solidBorder,
          color: COLOR.solidText,
          cursor: "not-allowed",
        }
      : {
          background: COLOR.solid,
          borderColor: COLOR.solid,
          color: "#ffffff",
          cursor: isReadonly ? "not-allowed" : "pointer",
        }
    : disabled
      ? {
          background: "#f3f4f6",
          borderColor: "#e5e7eb",
          color: "#d1d5db",
          cursor: "not-allowed",
        }
      : {
          background: "#ffffff",
          borderColor: "#e5e7eb",
          color: "#6b7280",
          cursor: "pointer",
        };

  const dotStyle: React.CSSProperties = isOn
    ? implied
      ? { background: COLOR.dot, borderColor: COLOR.dot }
      : { background: "#ffffff", borderColor: "#ffffff" }
    : { background: "transparent", borderColor: "currentColor", opacity: 0.4 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={() => !isReadonly && onChange(!checked)}
      style={buttonStyle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 select-none"
    >
      <span
        style={dotStyle}
        className="w-3.5 h-3.5 rounded-full border transition-all duration-200 flex-shrink-0"
      />
      {label}
      {implied && (
        <span className="text-[10px] font-normal opacity-60 ml-0.5">
          (auto)
        </span>
      )}
    </button>
  );
}

type TabType = PermissionType | "all";

function PermissionGroupCard({
  group,
  activeTab,
  permissions,
  impliedMap,
  baseRoleMap,
  onToggle,
}: {
  group: PermissionGroup;
  activeTab: TabType;
  permissions: CreateRoleDto;
  impliedMap: Record<string, boolean>;
  baseRoleMap: Record<string, boolean>;
  onToggle: (key: string, val: boolean) => void;
}) {
  const visibleNodes = group.permissions.filter(
    (n) => activeTab === "all" || n.type === activeTab,
  );

  if (visibleNodes.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex flex-col gap-3">
      <span className="text-sm font-semibold text-gray-700">{group.label}</span>
      <div className="flex flex-wrap gap-2">
        {visibleNodes.map((node) => {
          const camelKey = toCamelPermission(node.key);
          const isChecked = !!permissions[camelKey as keyof CreateRoleDto];
          const isImplied = !!impliedMap[camelKey];
          const isFromBase = !!baseRoleMap[camelKey];

          return (
            <div key={node.key} className={"flex"}>
              <PermissionToggle
                label={node.label}
                checked={isChecked || isFromBase}
                implied={isImplied || isFromBase}
                onChange={(val) => onToggle(camelKey, val)}
                disabled={node.type === PermissionType.project}
                type={node.type}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<TabType>(
    PermissionType.prepCourse,
  );

  const {
    data: { token },
  } = useAuthStore();

  const impliedMap = useMemo(
    () => computeImplied(newRole, hierarchy),
    [newRole, hierarchy],
  );

  // permissions that are forced true by the selected base role
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

  const tabs: { key: TabType; label: string }[] = [
    { key: PermissionType.prepCourse, label: "Cursinho" },
    { key: PermissionType.project, label: "Projeto" },
    { key: "all", label: "Todas" },
  ];

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
        <div className="flex flex-col gap-3">
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
              className="remove-arrow text-sm font-semibold text-marine px-3 py-2 rounded-lg shadow-sm border border-gray-200 bg-white z-50"
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

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: "#f97316" }}
            />
            Cursinho habilitado
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: "#fdba74" }}
            />
            Cursinho automático
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: "#3b82f6" }}
            />
            Projeto habilitado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
            Desabilitado
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 self-start">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                activeTab === tab.key
                  ? "bg-white text-marine shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Permission groups */}
        <div className="overflow-y-auto scrollbar-hide flex flex-col gap-3 pr-1">
          {hierarchy.map((group) => (
            <PermissionGroupCard
              key={group.key}
              group={group}
              activeTab={activeTab}
              permissions={newRole}
              impliedMap={impliedMap}
              baseRoleMap={baseRoleMap}
              onToggle={handleToggle}
            />
          ))}
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
