import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { iconPresets } from "@/config/materiaPresets";
import { useModals } from "@/hooks/useModal";
import { MateriaCanDeleteResult } from "@/services/content/getMateriaCanDelete";
import { MateriaDto } from "@/services/content/getMaterias";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn, type DataTableSort } from "@/components/ui/data-table";
import { ordenarLinhas } from "@/lib/ordenarLinhas";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

  const [sort, setSort] = useState<DataTableSort | undefined>();
  const linhas = useMemo(
    () =>
      ordenarLinhas(materias, sort, {
        nome: (m) => m.nome,
        enemArea: (m) => m.enemArea,
      }),
    [materias, sort],
  );

  const columns: DataTableColumn<MateriaDto>[] = [
    { id: "nome", header: "Nome", cell: (m) => m.nome, sortable: true },
    {
      id: "enemArea",
      header: "Área ENEM",
      cell: (m) => m.enemArea,
      sortable: true,
      width: "180px",
    },
    {
      id: "icon",
      header: "Ícone",
      align: "center",
      width: "80px",
      cell: (m) => {
        const Svg = m.icon ? iconPresets[m.icon] : undefined;
        return Svg ? <Svg className="w-6 h-6" /> : <span>-</span>;
      },
    },
    // Sem a permissão, a coluna aparecia vazia: só entra para quem edita.
    ...(manager
      ? [
          {
            id: "actions",
            header: "Ações",
            align: "center",
            width: "120px",
            cell: (m) => (
              <TooltipProvider delayDuration={200}>
                <div className="flex gap-2 justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Editar matéria"
                        onClick={() => editar(m)}
                      >
                        <Pencil />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar matéria</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir matéria"
                        className="text-destructive"
                        onClick={() => excluir(m)}
                      >
                        <Trash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir matéria</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            ),
          } as DataTableColumn<MateriaDto>,
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
        <h3 className="text-h3 font-semibold text-foreground">Matérias</h3>
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
                    <p className="text-caption text-muted-foreground">{materia.enemArea}</p>
                  </div>
                </div>
                {manager && (
                  <div className="flex gap-2 border-t pt-2">
                    <button
                      type="button"
                      onClick={() => editar(materia)}
                      className="flex-1 h-10 border rounded-md text-body"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => excluir(materia)}
                      className="flex-1 h-10 border border-destructive text-destructive rounded-md text-body"
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
        <Card className="h-full overflow-auto">
          <DataTable
            aria-label="Matérias"
            columns={columns}
            rows={linhas}
            getRowId={(m) => m._id}
            sort={sort}
            onSortChange={setSort}
            density="compact"
            className="border-0 rounded-none"
          />
        </Card>
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
        <AlertDialog
          open={modals.confirmDelete.isOpen}
          onOpenChange={(aberto) => {
            if (!aberto) {
              modals.confirmDelete.close();
              setSelected(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir matéria</AlertDialogTitle>
              <AlertDialogDescription>
                {blockReason ||
                  `Tem certeza que deseja excluir a matéria "${selected.nome}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!canDelete}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDelete();
                }}
              >
                Excluir matéria
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
