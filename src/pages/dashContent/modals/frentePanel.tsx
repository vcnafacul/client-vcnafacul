import { FrenteDto } from "@/dtos/content/contentDtoInput";
import {
  CreateFrenteDtoInput,
  UpdateFrenteDto,
} from "@/dtos/content/frenteDto";
import { Materias } from "@/enums/content/materias";
import { MateriasLabel } from "@/types/content/materiasLabel";
import { Button, IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { IoEyeSharp } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import ManagerFrente from "./managerFrente";
import SettingsSubject from "./settingsSubject";

interface Props {
  frentes: FrenteDto[];
  materia: Materias;
  updateSizeFrente: (id: string, size: number) => void;
  onCreate: (body: CreateFrenteDtoInput) => Promise<void>;
  onUpdate: (body: UpdateFrenteDto) => Promise<void>;
  onDelete: (id: string) => void;
}
export function FrentePanel({
  frentes,
  materia,
  updateSizeFrente,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [settings, setSettings] = useState<boolean>(false);
  const [openModalFrente, setOpenModalFrente] = useState<boolean>(false);
  const [frenteSelected, setFrenteSelected] = useState<FrenteDto | null>(null);
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
      width: 100,
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      field: "temas",
      headerName: "Temas",
      width: 100,
      renderCell: (params) => params.row.lenght || 0,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 100,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Tooltip title="Visualizar temas">
            <IconButton
              onClick={() => {
                setFrenteSelected(params.row);
                setSettings(true);
              }}
            >
              <IoEyeSharp className="fill-gray-500 hover:fill-black" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir Frente">
            <IconButton onClick={() => handleDelete(params.row)}>
              <MdDeleteForever className="fill-redError opacity-50 hover:opacity-100" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  const ModalFrente = () => {
    return openModalFrente ? (
      <ManagerFrente
        frente={frenteSelected}
        isOpen={openModalFrente && frenteSelected === null}
        materia={MateriasLabel.find((m) => m.value === materia)!}
        newFrente={onCreate}
        editFrente={onUpdate}
        handleClose={() => setOpenModalFrente(false)}
      />
    ) : null;
  };

  const SettingsModal = () => {
    return !settings ? null : (
      <SettingsSubject
        isOpen={settings}
        handleClose={() => {
          setSettings(false);
        }}
        frente={frenteSelected!}
        updateSizeFrente={(size: number) =>
          updateSizeFrente(frenteSelected!.id, size)
        }
      />
    );
  };

  return (
    <div className="flex flex-col h-[500px] overflow-y-scroll scrollbar-hide select-none">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Frentes</h3>
        <Button onClick={() => setOpenModalFrente(true)}>
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
    </div>
  );
}
