import { ChangeOrderDTO } from "@/dtos/content/changeOrder";
import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import {
  CreateSubjectDtoInput,
  UpdateSubjectDto,
} from "@/dtos/content/SubjectDto";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { changeOrderDemand } from "@/services/content/changeOrderDemand";
import { useAuthStore } from "@/store/auth";
import { Button, IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { CgArrowsExchangeAltV } from "react-icons/cg";
import { MdDeleteForever, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import ManagerSubject from "./managerSubject";
import OrderEditContent from "./orderEditContent";
import { StatusContent } from "@/enums/content/statusContent";
import { useModals } from "@/hooks/useModal";

interface Props {
  subjects: SubjectDto[];
  frente: FrenteDto;
  onCreate: (body: CreateSubjectDtoInput) => Promise<void>;
  onUpdate: (body: UpdateSubjectDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PanelSubject({
  subjects,
  frente,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [subjectSelected, setSubjectSelected] = useState<SubjectDto | null>(
    null
  );

  const modals = useModals([
    'subjectEditor',
    'orderEdit',
  ]);

  const {
    data: { token },
  } = useAuthStore();

  const handleDelete = (subject: SubjectDto) => {
    if (subject.lenght > 0) {
      toast.warn("Temas com conteúdos cadastrados, impossivel excluir");
    }
    onDelete(subject.id);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tema", flex: 1 },
    {
      field: "total",
      headerName: "Total",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: (params) => {
        const contents: {
          id: string;
          status: number;
        }[] = params.row.contents || [];
        return contents.length || 0;
      },
    },
    {
      field: "approved",
      headerName: "Aprovadas",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: (params) => {
        const contents: {
          id: string;
          status: number;
        }[] = params.row.contents || [];
        return (
          contents.filter((c) => c.status === StatusEnum.Approved).length || 0
        );
      },
    },
    {
      field: "pending",
      headerName: "Pendentes",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: (params) => {
        const contents: {
          id: string;
          status: number;
        }[] = params.row.contents || [];
        return (
          contents.filter((c) => c.status === StatusEnum.Pending).length || 0
        );
      },
    },
    {
      field: "pending_upload",
      headerName: "Pendentes Upload",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: (params) => {
        const contents: {
          id: string;
          status: number;
        }[] = params.row.contents || [];
        return (
          contents.filter((c) => c.status === StatusContent.Pending_Upload).length || 0
        );
      },
    },
    {
      field: "rejected",
      headerName: "Reprovadas",
      align: "center",
      headerAlign: "center",
      width: 100,
      renderCell: (params) => {
        const contents: {
          id: string;
          status: number;
        }[] = params.row.contents || [];
        return (
          contents.filter((c) => c.status === StatusEnum.Rejected).length || 0
        );
      },
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
      field: "actions",
      headerName: "Ações",
      align: "center",
      headerAlign: "center",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Editar tema">
            <IconButton
              onClick={() => {
                setSubjectSelected(params.row);
                modals.subjectEditor.open();
              }}
            >
              <MdModeEdit className="fill-gray-500 hover:fill-black" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar order conteúdos">
            <IconButton
              onClick={() => {
                setSubjectSelected(params.row);
                modals.orderEdit.open();
              }}
            >
              <CgArrowsExchangeAltV className="fill-gray-500 hover:fill-black" />
            </IconButton>
          </Tooltip>
          {params.row.contents?.length === 0 && (
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

  const ModalSubject = () => {
    return modals.subjectEditor.isOpen ? (
      <ManagerSubject
        isOpen={modals.subjectEditor.isOpen}
        frente={frente}
        subject={subjectSelected}
        newSubject={onCreate}
        editSubject={onUpdate}
        handleClose={() => modals.subjectEditor.close()}
      />
    ) : null;
  };

  const ModalOrderEdit = () => {
    return !modals.orderEdit.isOpen ? null : (
      <OrderEditContent
        isOpen={modals.orderEdit.isOpen}
        handleClose={() => modals.orderEdit.close()}
        contents={subjectSelected!.contents}
        listId={subjectSelected!.id}
        updateOrder={(body: ChangeOrderDTO) => changeOrderDemand(token, body)}
      />
    );
  };

  return (
    <div className="flex flex-col h-[500px] overflow-y-scroll scrollbar-hide">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Temas</h3>
        <Button onClick={() => modals.subjectEditor.open()}>
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
      <ModalOrderEdit />
    </div>
  );
}
