import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getWaitingListInfo } from "@/services/prepCourse/inscription/getWaitingList";
import { sendEmailWaitingList } from "@/services/prepCourse/inscription/sendEmailWaitingList";
import { useAuthStore } from "@/store/auth";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { CgReorder } from "react-icons/cg";
import { FaFilePdf } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { toast } from "react-toastify";

import { updateOrderWaitingListInfo } from "@/services/prepCourse/inscription/updateOrderWaitingList";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import WaitingListEdit from "./waitingListEdit";
pdfMake.vfs = pdfFonts as unknown as { [file: string]: string };

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  inscriptionId: string;
}

interface Student {
  id: string;
  position: number;
  name: string;
}

export function WaitingList(props: Props) {
  const {
    data: { token },
  } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function convertStudentsToTableData(students: Student[]): any[] {
    // Cabeçalho da tabela
    const header = [
      { text: "Posição", style: "tableCell" },
      { text: "Nome Completo", style: "tableCell" },
    ];

    const rows = students.map((student) => [
      { text: student.position, style: "tableCell" },
      { text: student.name, style: "tableCell" },
    ]);

    // Retorna o cabeçalho seguido pelas linhas
    return [header, ...rows];
  }

  const downloadPDF = () => {
    const datet = new Date();
    const date = format(datet, "dd/MM/yyyy HH:mm");
    return pdfMake
      .createPdf({
        content: [
          {
            text: `Lista de Espera ${date}`,
            style: "header",
          },
          {
            table: {
              body: convertStudentsToTableData(students),
            },
            layout: "lightHorizontalLines",
            alignment: "center", // Centraliza horizontalmente
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10],
          },
          tableCell: {
            alignment: "center", // Centraliza o conteúdo das células
          },
        },
      })
      .download(`relatorio-estudantes-${datet.getTime()}.pdf`);
  };

  const handleEmailWaitingList = () => {
    const id = toast.loading("Enviando Email Lista de Espera Altualizada ...");
    sendEmailWaitingList(props.inscriptionId, token)
      .then(() => {
        toast.update(id, {
          render: "Email enviado com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao enviar email",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const updateOrder = (studentsId: string[]) => {
    const id = toast.loading("Atualizando Order Lista de Espera ...");
    updateOrderWaitingListInfo(props.inscriptionId, studentsId, token)
      .then(() => {
        toast.update(id, {
          render: "Atualizada com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        getWaitingList();
        setOpenEdit(false);
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao enviar email",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const ModalEditWailtingList = () => {
    return openEdit ? (
      <WaitingListEdit
        isOpen={openEdit}
        handleClose={() => setOpenEdit(false)}
        inscriptionId={props.inscriptionId}
        students={students}
        updateOder={updateOrder}
      />
    ) : null;
  };

  const getWaitingList = () => {
    getWaitingListInfo(props.inscriptionId, token)
      .then((res) => {
        setStudents(res);
      })
      .catch(() => {
        toast.error("Erro ao buscar lista de espera");
      });
  };

  useEffect(() => {
    getWaitingList();
  }, []);

  return (
    <>
      <ModalTemplate {...props} className="bg-white p-4 rounded-md">
        <div className="w-full overflow-y-auto scrollbar-hide flex flex-col gap-4">
          <Text size="secondary">Lista de Espera</Text>
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Nome Completo</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {students.map((stu) => (
                <tr key={stu.id} className="even:bg-gray-200">
                  <td className="text-center">{stu.position}</td>
                  <td className="whitespace-nowrap text-sm font-medium p-2 text-center">
                    {stu.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between gap-4">
            <Button
              size="small"
              typeStyle="refused"
              onClick={() => downloadPDF()}
            >
              <FaFilePdf className="h-6 w-10" />
            </Button>
            <Button
              size="small"
              typeStyle="primary"
              onClick={() => setOpenEdit(true)}
            >
              <div className="flex items-center">
                <CgReorder className="h-6 w-10" />
                <p className="text-sm leading-3">Editar Ordem</p>
              </div>
            </Button>
            <AlertDialogUI
              title="Lista de Espera Atualizada"
              description="Enviar email com lista de espera atualizada para os estudantes"
              onConfirm={() => handleEmailWaitingList()}
            >
              <AlertDialogTrigger>
                <Button
                  size="small"
                  typeStyle="accepted"
                  className="w-full border-zinc-200"
                >
                  <div className="flex justify-center items-center">
                    <MdEmail className="h-6 w-10" />
                    <p className="text-sm leading-3">
                      Enviar Lista de Espera Atualizada
                    </p>
                  </div>
                </Button>
              </AlertDialogTrigger>
            </AlertDialogUI>
          </div>
        </div>
      </ModalTemplate>
      <ModalEditWailtingList />
    </>
  );
}
