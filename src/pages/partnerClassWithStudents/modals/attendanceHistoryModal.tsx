import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Roles } from "@/enums/roles/roles";
import { deleteAttendanceRecord } from "@/services/prepCourse/attendanceRecord/deleteAttendanceRecord";
import { getAttendanceRecord } from "@/services/prepCourse/attendanceRecord/getAttendanceRecord";
import { useAuthStore } from "@/store/auth";
import { SimpleAttendanceRecordHistory } from "@/types/partnerPrepCourse/attendanceRecordHistory";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { FaRegListAlt } from "react-icons/fa";
import { IoClose, IoEyeSharp } from "react-icons/io5";
import { MdPlaylistAddCircle } from "react-icons/md";
import { toast } from "react-toastify";
import { AttendanceRecordModal } from "./attendanceRecordModal";
import AttendanceRecordSummaryModal from "./attendanceRecordSummaryModal";
import { NewAttendanceRecordModal } from "./newAttendanceRecordModal";
interface AttendanceHistoryProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
}

export function AttendanceHistoryModal({
  isOpen,
  handleClose,
  classId,
}: AttendanceHistoryProps) {
  const [attendanceHistory, setAttendanceHistory] = useState<
    SimpleAttendanceRecordHistory[]
  >([]);
  const [attendanceHistorySelected, setAttendanceHistorySelected] =
    useState<SimpleAttendanceRecordHistory>();
  const [openAttendanceRecord, setOpenAttendanceRecord] =
    useState<boolean>(false);
  const [openNewAttendanceRecord, setOpenNewAttendanceRecord] =
    useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(100);
  const [summary, setSummary] = useState<boolean>(false);
  const limit = 10;

  const {
    data: { token, permissao },
  } = useAuthStore();

  const handleActionDeleteRecord = (params: SimpleAttendanceRecordHistory) => {
    if (!permissao[Roles.gerenciarTurmas]) {
      toast.warn(" Vocé nao tem permissão para excluir registros", {
        theme: "dark",
      });
    } else {
      setAttendanceHistorySelected(params);
      setOpenDeleteModal(true);
    }
  };

  const handleDeleteRecord = () => {
    deleteAttendanceRecord(token, attendanceHistorySelected!.id).then(() => {
      const filtered = attendanceHistory.filter(
        (item) => item.id !== attendanceHistorySelected!.id
      );
      setAttendanceHistory(filtered);
      setOpenDeleteModal(false);
    });
  };

  const ModalConfirmDelete = () => {
    return !openDeleteModal ? null : (
      <ModalConfirmCancel
        isOpen={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        handleConfirm={handleDeleteRecord}
        text="Tem certeza que deseja excluir esse registro?"
        className="bg-white p-4 rounded-md w-[512px]"
      />
    );
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Visualizar">
            <IconButton
              onClick={() => {
                setAttendanceHistorySelected(params.row);
                setOpenAttendanceRecord(true);
              }}
            >
              <IoEyeSharp className="h-6 w-6 fill-gray-500 hover:fill-marine opacity-60 hover:opacity-100" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton onClick={() => handleActionDeleteRecord(params.row)}>
              <IoClose className="h-6 w-6 fill-gray-500 hover:fill-red opacity-60 hover:opacity-100" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
    {
      field: "registeredBy",
      headerName: "Registrado por",
      flex: 1,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "registeredAt",
      headerName: "Registrado em",
      width: 150,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const date = new Date(params.row.registeredAt);
        return date.toLocaleDateString("pt-BR");
      },
    },
  ];

  const paginationModel = { page: 0, pageSize: limit };

  const ModalAttendanceRecord = () => {
    return !openAttendanceRecord ? null : (
      <AttendanceRecordModal
        isOpen={openAttendanceRecord}
        handleClose={() => setOpenAttendanceRecord(false)}
        attendanceId={attendanceHistorySelected!.id}
      />
    );
  };

  const ModalNewAttendanceRecord = () => {
    return !openNewAttendanceRecord ? null : (
      <NewAttendanceRecordModal
        isOpen={openNewAttendanceRecord}
        handleClose={() => setOpenNewAttendanceRecord(false)}
        classId={classId}
        handleNewAttendanceRecord={(res: SimpleAttendanceRecordHistory) => {
          setAttendanceHistory([res, ...attendanceHistory]);
        }}
      />
    );
  };

  const ModalAttendanceRecordSummary = () => {
    return !summary ? null : (
      <AttendanceRecordSummaryModal
        isOpen={summary}
        handleClose={() => setSummary(false)}
        classId={classId}
      />
    );
  };

  const getAttendanceHistory = async (page: number, limit: number) => {
    getAttendanceRecord(token, page, limit, classId)
      .then((res) => {
        setAttendanceHistory(res.data);
        setTotalItems(res.totalItems);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  useEffect(() => {
    getAttendanceHistory(1, limit);
  }, []);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md h-[584px] w-[95vw] sm:w-[600px]"
    >
      <div className="flex gap-2">
        <button
          onClick={() => setOpenNewAttendanceRecord(true)}
          className="px-4 py-1.5 mb-1 text-white bg-marine rounded-md hover:opacity-90"
        >
          <div className="flex items-center gap-2 justify-center">
            <MdPlaylistAddCircle className="w-5 h-5" />
            Novo Registro
          </div>
        </button>
        {permissao[Roles.gerenciarTurmas] && (
          <button
            onClick={() => setSummary(true)}
            className="px-4 py-1.5 mb-1 text-white bg-marine rounded-md hover:opacity-90"
          >
            <div className="flex items-center gap-2 justify-center">
              <FaRegListAlt />
              Relatório
            </div>
          </button>
        )}
      </div>
      <Paper sx={{ height: "88%", width: "100%" }} className="border">
        <DataGrid
          rows={attendanceHistory}
          columns={columns}
          rowCount={totalItems}
          paginationMode="server"
          initialState={{ pagination: { paginationModel } }}
          rowHeight={40}
          columnHeaderHeight={30}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
          onPaginationModelChange={(newPageSize) => {
            getAttendanceHistory(newPageSize.page + 1, newPageSize.pageSize);
          }}
        />
      </Paper>
      <ModalAttendanceRecord />
      <ModalNewAttendanceRecord />
      <ModalConfirmDelete />
      <ModalAttendanceRecordSummary />
    </ModalTemplate>
  );
}
