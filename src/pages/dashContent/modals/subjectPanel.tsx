import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import {
  CreateSubjectDtoInput,
  UpdateSubjectDto,
} from "@/dtos/content/SubjectDto";
import { Button, IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { IoEyeSharp } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import ManagerSubject from "./managerSubject";

interface Props {
  subjects: SubjectDto[];
  frente: FrenteDto;
  onCreate: (body: CreateSubjectDtoInput) => Promise<void>;
  onUpdate: (body: UpdateSubjectDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SubjectPanel({
  subjects,
  frente,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [openModalSubject, setOpenModalSubject] = useState<boolean>(false);
  const [subjectSelected, setSubjectSelected] = useState<SubjectDto | null>(
    null
  );

  const handleDelete = (subject: SubjectDto) => {
    if (subject.lenght > 0) {
      toast.warn("Temas com conteúdos cadastrados, impossivel excluir");
    }
    onDelete(subject.id);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tema", flex: 1 },
    {
      field: "createdAt",
      headerName: "Criado em",
      width: 100,
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      field: "demandas",
      headerName: "Demandas",
      width: 100,
      renderCell: (params) => {
        const demandCounts = params.row.demandCounts || {};
        return (
          <div className="text-xs leading-5">
            <p>Total: {demandCounts.total || 0}</p>
            <p>Aprovadas: {demandCounts.approved || 0}</p>
            <p>Revisando: {demandCounts.review || 0}</p>
            <p>Pendentes: {demandCounts.pending || 0}</p>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 100,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Tooltip title="Editar tema">
            <IconButton
              onClick={() => {
                setSubjectSelected(params.row);
                setOpenModalSubject(true);
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

  const ModalSubject = () => {
    return openModalSubject ? (
      <ManagerSubject
        isOpen={openModalSubject}
        frente={frente}
        subject={subjectSelected}
        newSubject={onCreate}
        editSubject={onUpdate}
        handleClose={() => setOpenModalSubject(false)}
      />
    ) : null;
  };

  return (
    <div className="flex flex-col h-[500px] overflow-y-scroll scrollbar-hide">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Temas</h3>
        <Button onClick={() => setOpenModalSubject(true)}>
          Criar Novo Tema
        </Button>
      </div>
      <Paper sx={{ height: "100%" }}>
        <DataGrid
          rows={subjects}
          columns={columns}
          getRowId={(row) => row.id}
          rowHeight={60}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>
      <ModalSubject />
    </div>
  );
}
