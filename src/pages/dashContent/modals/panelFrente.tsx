import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import {
  CreateFrenteDtoInput,
  UpdateFrenteDto,
} from "@/dtos/content/frenteDto";
import {
  CreateSubjectDtoInput,
  UpdateSubjectDto,
} from "@/dtos/content/SubjectDto";
import { useModals } from "@/hooks/useModal";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { ExpandableFrente, FrenteCard } from "./components/expandableFrente";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import ManagerFrente from "./managerFrente";
import ManagerSubject from "./managerSubject";
import { useAuthStore } from "@/store/auth";
import { Roles } from "@/enums/roles/roles";

interface Props {
  frentes: FrenteDto[];
  materia: string;
  materiaLabel: string;
  onCreate: (body: CreateFrenteDtoInput) => Promise<void>;
  onUpdate: (body: UpdateFrenteDto) => Promise<void>;
  onDelete?: (frenteId: string) => Promise<void>;
  onCreateTema: (body: CreateSubjectDtoInput) => Promise<void>;
  onUpdateTema: (body: UpdateSubjectDto, frenteId: string) => Promise<void>;
  onDeleteTema: (temaId: string, frenteId: string) => Promise<void>;
  onReorderTemas: (
    frenteId: string,
    node1: string,
    node2: string,
  ) => Promise<void>;
}

export function PanelFrente({
  frentes,
  materia,
  materiaLabel,
  onCreate,
  onUpdate,
  onDelete,
  onCreateTema,
  onUpdateTema,
  onDeleteTema,
  onReorderTemas,
}: Props) {
  const [frenteSelected, setFrenteSelected] = useState<FrenteDto | null>(null);
  const [frenteForNewTema, setFrenteForNewTema] = useState<FrenteDto | null>(
    null,
  );

  const modals = useModals(["frenteEditor", "confirmDelete", "newTema"]);

  const {
    data: { permissao },
  } = useAuthStore();
  const manager: boolean = permissao[Roles.editarMateriasFrentes];
  // Abaixo de 768px (o `sm` do projeto) a tabela vira cards.
  const acimaDeSm = useAcimaDeSm();

  const acoesDaFrente = (frente: FrenteDto) => {
    const frenteId = frente._id || frente.id;
    return {
      frente,
      temas: (frente.subjects ?? []) as SubjectDto[],
      onEditFrente: () => {
        setFrenteSelected(frente);
        modals.frenteEditor.open();
      },
      onDeleteFrente: onDelete
        ? () => {
            setFrenteSelected(frente);
            modals.confirmDelete.open();
          }
        : undefined,
      onAddTema: () => {
        setFrenteForNewTema(frente);
        modals.newTema.open();
      },
      onUpdateTema: (body: UpdateSubjectDto) => onUpdateTema(body, frenteId),
      onDeleteTema: (id: string) => onDeleteTema(id, frenteId),
      onReorderTemas: (node1: string, node2: string) =>
        onReorderTemas(frenteId, node1, node2),
    };
  };

  return (
    // No celular sem altura fixa: rolagem dentro de rolagem, e a lista em cards.
    <div className="flex flex-col sm:h-[500px] sm:overflow-y-scroll scrollbar-hide select-none">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Frentes</h3>
        {manager && (
          <Button
            onClick={() => {
              setFrenteSelected(null);
              modals.frenteEditor.open();
            }}
          >
            Criar Nova Frente
          </Button>
        )}
      </div>

      {!acimaDeSm ? (
        frentes.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            Nenhuma frente cadastrada para esta matéria
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {frentes.map((frente) => (
              <FrenteCard
                key={frente._id || frente.id}
                {...acoesDaFrente(frente)}
              />
            ))}
          </ul>
        )
      ) : (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.50" }}>
              <TableCell size="small" className="w-5" />
              <TableCell
                size="small"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Nome
              </TableCell>
              <TableCell
                size="small"
                align="right"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Temas
              </TableCell>
              <TableCell
                size="small"
                align="right"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {frentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma frente cadastrada para esta matéria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              frentes.map((frente) => {
                const frenteId = frente._id || frente.id;
                return (
                  <ExpandableFrente
                    key={frenteId}
                    frente={frente}
                    temas={(frente.subjects ?? []) as SubjectDto[]}
                    onEditFrente={() => {
                      setFrenteSelected(frente);
                      modals.frenteEditor.open();
                    }}
                    onDeleteFrente={
                      onDelete
                        ? () => {
                            setFrenteSelected(frente);
                            modals.confirmDelete.open();
                          }
                        : undefined
                    }
                    onAddTema={() => {
                      setFrenteForNewTema(frente);
                      modals.newTema.open();
                    }}
                    onUpdateTema={(body) => onUpdateTema(body, frenteId)}
                    onDeleteTema={(id) => onDeleteTema(id, frenteId)}
                    onReorderTemas={(node1, node2) =>
                      onReorderTemas(frenteId, node1, node2)
                    }
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {modals.frenteEditor.isOpen && (
        <ManagerFrente
          frente={frenteSelected}
          isOpen={modals.frenteEditor.isOpen}
          materia={{ value: materia, label: materiaLabel }}
          newFrente={onCreate}
          editFrente={onUpdate}
          handleClose={() => {
            modals.frenteEditor.close();
            setFrenteSelected(null);
          }}
        />
      )}

      {modals.confirmDelete.isOpen && frenteSelected && onDelete && (
        <ModalConfirmCancel
          isOpen={modals.confirmDelete.isOpen}
          handleClose={() => {
            modals.confirmDelete.close();
            setFrenteSelected(null);
          }}
          handleConfirm={() => {
            const id = frenteSelected._id || frenteSelected.id;
            onDelete(id)
              .then(() => {
                modals.confirmDelete.close();
                setFrenteSelected(null);
              })
              .catch(() => {});
          }}
          className="bg-white p-8 rounded-md"
        >
          <p className="text-gray-600">
            Tem certeza que deseja excluir a frente &quot;{frenteSelected.nome}
            &quot;?
          </p>
        </ModalConfirmCancel>
      )}

      {modals.newTema.isOpen && frenteForNewTema && (
        <ManagerSubject
          isOpen={modals.newTema.isOpen}
          frente={frenteForNewTema}
          subject={null}
          newSubject={onCreateTema}
          editSubject={async () => {
            /* no-op — create mode */
          }}
          handleClose={() => {
            modals.newTema.close();
            setFrenteForNewTema(null);
          }}
        />
      )}
    </div>
  );
}
