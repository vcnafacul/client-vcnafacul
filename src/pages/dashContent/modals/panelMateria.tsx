import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { iconPresets } from "@/config/materiaPresets";
import { useModals } from "@/hooks/useModal";
import { MateriaCanDeleteResult } from "@/services/content/getMateriaCanDelete";
import { MateriaDto } from "@/services/content/getMaterias";
import { Button, IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { useEffect, useState } from "react";
import { MdDeleteForever, MdModeEdit } from "react-icons/md";
import ManagerMateria from "./managerMateria";
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";

interface Props {
  materias: MateriaDto[];
  onCreate: (data: {
    nome: string;
    enemArea: string;
    icon: string;
    image: string;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    data: { nome?: string; enemArea?: string; icon?: string; image?: string },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  /** Verifica se a matéria pode ser excluída (sem frentes/questões vinculadas). Se não for passado, o modal não exibe validação prévia. */
  checkCanDelete?: (id: string) => Promise<MateriaCanDeleteResult>;
}

export function PanelMateria({
  materias,
  onCreate,
  onUpdate,
  onDelete,
  checkCanDelete,
}: Props) {
  const [selected, setSelected] = useState<MateriaDto | null>(null);
  const [canDeleteState, setCanDeleteState] =
    useState<MateriaCanDeleteResult | null>(null);

  const modals = useModals(["editor", "confirmDelete"]);

  const {
    data: { permissao },
  } = useAuthStore();
  const manager: boolean = permissao[Roles.editarMateriasFrentes];
  // Abaixo de 768px (o `sm` do projeto) a tabela vira cards.
  const acimaDeSm = useAcimaDeSm();

  const editar = (materia: MateriaDto) => {
    setSelected(materia);
    modals.editor.open();
  };
  const excluir = (materia: MateriaDto) => {
    setSelected(materia);
    modals.confirmDelete.open();
  };

  useEffect(() => {
    if (!modals.confirmDelete.isOpen || !selected || !checkCanDelete) {
      setCanDeleteState(null);
      return;
    }
    let cancelled = false;
    checkCanDelete(selected._id)
      .then((res) => {
        if (!cancelled) setCanDeleteState(res);
      })
      .catch(() => {
        if (!cancelled)
          setCanDeleteState({
            canDelete: true,
            frentesCount: 0,
            questoesCount: 0,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [modals.confirmDelete.isOpen, selected?._id, checkCanDelete]);

  const columns: GridColDef[] = [
    { field: "nome", headerName: "Nome", flex: 1 },
    {
      field: "enemArea",
      headerName: "Área ENEM",
      width: 180,
    },
    {
      field: "icon",
      headerName: "Ícone",
      align: "center",
      headerAlign: "center",
      width: 80,
      renderCell: (params) => {
        const Svg = iconPresets[params.row.icon];
        return Svg ? <Svg className="w-6 h-6" /> : <span>-</span>;
      },
    },
    // Sem a permissão, a coluna aparecia vazia: só entra para quem edita.
    ...(manager
      ? [
          {
            field: "actions",
            headerName: "Ações",
            align: "center",
            headerAlign: "center",
            width: 120,
            renderCell: (params) => (
              <div className="flex gap-2 justify-center">
                <Tooltip title="Editar matéria">
                  <IconButton onClick={() => editar(params.row as MateriaDto)}>
                    <MdModeEdit className="fill-gray-500 hover:fill-black" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir matéria">
                  <IconButton onClick={() => excluir(params.row as MateriaDto)}>
                    <MdDeleteForever className="fill-redError opacity-50 hover:opacity-100" />
                  </IconButton>
                </Tooltip>
              </div>
            ),
          } as GridColDef,
        ]
      : []),
  ];

  const canDelete = canDeleteState?.canDelete !== false;
  const blockReason =
    canDeleteState && !canDeleteState.canDelete ? canDeleteState.message : null;

  const handleConfirmDelete = () => {
    if (!selected || !canDelete) return;
    onDelete(selected._id)
      .then(() => {
        modals.confirmDelete.close();
        setSelected(null);
      })
      .catch(() => {});
  };

  return (
    // No celular sem altura fixa: rolagem dentro de rolagem, e a lista em cards.
    <div className="flex flex-col sm:h-[500px] sm:overflow-y-scroll scrollbar-hide select-none">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Matérias</h3>
        {manager && (
          <Button
            onClick={() => {
              setSelected(null);
              modals.editor.open();
            }}
          >
            Criar Nova Matéria
          </Button>
        )}
      </div>
      {!acimaDeSm ? (
        // No celular a coluna de ações ficava ~190px fora da tela.
        <ul className="flex flex-col gap-2">
          {materias.map((materia) => {
            const Icone = materia.icon ? iconPresets[materia.icon] : undefined;
            return (
              <li
                key={materia._id}
                className="border rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  {Icone && <Icone className="w-6 h-6 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{materia.nome}</p>
                    <p className="text-xs text-gray-500">{materia.enemArea}</p>
                  </div>
                </div>
                {manager && (
                  <div className="flex gap-2 border-t pt-2">
                    <button
                      type="button"
                      onClick={() => editar(materia)}
                      className="flex-1 h-10 border rounded-md text-sm"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => excluir(materia)}
                      className="flex-1 h-10 border border-redError text-redError rounded-md text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <Paper sx={{ height: "100%", overflow: "auto" }}>
          <DataGrid
            rows={materias}
            columns={columns}
            getRowId={(row) => row._id}
            rowHeight={40}
            sx={{ border: 0 }}
          />
        </Paper>
      )}

      {modals.editor.isOpen && (
        <ManagerMateria
          isOpen={modals.editor.isOpen}
          handleClose={() => {
            modals.editor.close();
            setSelected(null);
          }}
          materia={selected}
          onSubmit={async (data) => {
            if (selected) {
              await onUpdate(selected._id, data);
            } else {
              await onCreate(data);
            }
          }}
        />
      )}

      {modals.confirmDelete.isOpen && selected && (
        <ModalConfirmCancel
          isOpen={modals.confirmDelete.isOpen}
          handleClose={() => {
            modals.confirmDelete.close();
            setSelected(null);
          }}
          handleConfirm={handleConfirmDelete}
          className="bg-white p-8 rounded-md"
          confirmDisabled={!canDelete}
        >
          {blockReason ? (
            <p className="text-gray-600">{blockReason}</p>
          ) : (
            <p className="text-gray-600">
              Tem certeza que deseja excluir a matéria &quot;{selected.nome}
              &quot;?
            </p>
          )}
        </ModalConfirmCancel>
      )}
    </div>
  );
}
