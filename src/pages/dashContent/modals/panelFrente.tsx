import { ChangeOrderDTO } from "@/dtos/content/changeOrder";
import { FrenteDto } from "@/dtos/content/contentDtoInput";
import {
  CreateFrenteDtoInput,
  UpdateFrenteDto,
} from "@/dtos/content/frenteDto";
import { Materias } from "@/enums/content/materias";
import { changeOrderSubject } from "@/services/content/changeOrderSubject";
import { useAuthStore } from "@/store/auth";
import { MateriasLabel } from "@/types/content/materiasLabel";
import { Button, IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { CgArrowsExchangeAltV } from "react-icons/cg";
import { IoEyeSharp } from "react-icons/io5";
import { MdDeleteForever, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import ManagerFrente from "./managerFrente";
import OrderEditSubject from "./orderEditSubject";
import SettingsSubject from "./settingsSubject";
import { useModals } from "@/hooks/useModal";

interface Props {
  frentes: FrenteDto[];
  materia: Materias;
  updateSizeFrente: (id: string, size: number) => void;
  onCreate: (body: CreateFrenteDtoInput) => Promise<void>;
  onUpdate: (body: UpdateFrenteDto) => Promise<void>;
  onDelete: (id: string) => void;
}
export function PanelFrente({
  frentes,
  materia,
  updateSizeFrente,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [frenteSelected, setFrenteSelected] = useState<FrenteDto | null>(null);

  const modals = useModals([
    'settings',
    'frenteEditor',
    'orderEdit',
  ]);

  const {
    data: { token },
  } = useAuthStore();

  const handleDelete = (frente: FrenteDto) => {
    if (frente.lenght > 0) {
      toast.warn("Frente com temas cadastrados, impossivel excluir");
    }
    onDelete(frente.id);
  };
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Frente",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Criado em",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      field: "temas",
      headerName: "Temas",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: (params) => params.row.lenght || 0,
    },
    {
      field: "actions",
      headerName: "Ações",
      align: "center",
      headerAlign: "center",
      width: 200,
      renderCell: (params) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Visualizar temas">
            <IconButton
              onClick={() => {
                setFrenteSelected(params.row);
                modals.settings.open();
              }}
            >
              <IoEyeSharp className="fill-gray-500 hover:fill-black" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar tema">
            <IconButton
              onClick={() => {
                setFrenteSelected(params.row);
                modals.frenteEditor.open();
              }}
            >
              <MdModeEdit className="fill-gray-500 hover:fill-black" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar order conteúdos">
            <IconButton
              onClick={() => {
                setFrenteSelected(params.row);
                modals.orderEdit.open();
              }}
            >
              <CgArrowsExchangeAltV className="fill-gray-500 hover:fill-black" />
            </IconButton>
          </Tooltip>
          {params.row.lenght === 0 && (
            <Tooltip title="Excluir Frente">
              <IconButton onClick={() => handleDelete(params.row)}>
                <MdDeleteForever className="fill-redError opacity-50 hover:opacity-100" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const ModalFrente = () => {
    return modals.frenteEditor.isOpen ? (
      <ManagerFrente
        frente={frenteSelected}
        isOpen={modals.frenteEditor.isOpen}
        materia={MateriasLabel.find((m) => m.value === materia)!}
        newFrente={onCreate}
        editFrente={onUpdate}
        handleClose={() => modals.frenteEditor.close()}
      />
    ) : null;
  };

  const SettingsModal = () => {
    return !modals.settings.isOpen ? null : (
      <SettingsSubject
        isOpen={modals.settings.isOpen}
        handleClose={() => {
          modals.settings.close();
        }}
        frente={frenteSelected!}
        updateSizeFrente={(size: number) =>
          updateSizeFrente(frenteSelected!.id, size)
        }
      />
    );
  };

  const ModalOrderEdit = () => {
    return !modals.orderEdit.isOpen ? null : (
      <OrderEditSubject
        isOpen={modals.orderEdit.isOpen}
        handleClose={() => modals.orderEdit.close()}
        subjects={frenteSelected!.subjects}
        listId={frenteSelected!.id}
        updateOrder={(body: ChangeOrderDTO) => changeOrderSubject(token, body)}
      />
    );
  };

  return (
    <div className="flex flex-col h-[500px] overflow-y-scroll scrollbar-hide select-none">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Frentes</h3>
        <Button onClick={() => modals.frenteEditor.open()}>
          Criar Nova Frente
        </Button>
      </div>
      <Paper sx={{ height: "100%", overflow: "auto" }}>
        <DataGrid
          rows={frentes}
          columns={columns}
          getRowId={(row) => row.id}
          rowHeight={40}
          sx={{ border: 0 }}
        />
      </Paper>
      <SettingsModal />
      <ModalFrente />
      <ModalOrderEdit />
    </div>
  );
}
