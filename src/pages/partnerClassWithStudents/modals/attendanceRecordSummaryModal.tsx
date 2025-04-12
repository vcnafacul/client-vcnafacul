import logo from "@/assets/images/logo_carteirinha.png";
import ModalTemplate from "@/components/templates/modalTemplate";
import { AttendanceRecordSummary } from "@/dtos/attendanceRecord/attendanceRecordSummary";
import { getSummary } from "@/services/prepCourse/attendanceRecord/getSummary";
import { useAuthStore } from "@/store/auth";
import { downloadPDF } from "@/utils/get-pdf";
import { getBase64FromImageUrl } from "@/utils/getBase64FromImageUrl";
import { yupResolver } from "@hookform/resolvers/yup";
import { format, parseISO } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Calendar } from "primereact/calendar";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";
import * as yup from "yup";

interface AttendanceRecordSummaryProps {
  isOpen: boolean;
  handleClose: () => void;
  classId: string;
}

export default function AttendanceRecordSummaryModal({
  isOpen,
  handleClose,
  classId,
}: AttendanceRecordSummaryProps) {
  const {
    data: { token },
  } = useAuthStore();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const end = new Date();

  const schema = yup
    .object()
    .shape({
      range: yup
        .array()
        .of(yup.date().required("Data obrigatória"))
        .length(2, "Selecione um intervalo de datas válido")
        .test(
          "valid-date-range",
          "O intervalo não pode ser maior que 30 dias (exceto se estiver dentro do mesmo mês)",
          (value) => {
            if (!value || value.length !== 2) return false;
            const [startDate, endDate] = value;

            const diffInDays = Math.floor(
              (new Date(endDate).setHours(23, 59, 59, 999) -
                new Date(startDate).setHours(0, 0, 0, 0)) /
                (1000 * 60 * 60 * 24)
            );

            if (diffInDays <= 30) return true;

            const sameMonth =
              new Date(startDate).getMonth() === new Date(endDate).getMonth();
            const sameYear =
              new Date(startDate).getFullYear() ===
              new Date(endDate).getFullYear();

            return diffInDays === 31 && sameMonth && sameYear;
          }
        )
        .test("no-future-dates", "Datas não podem estar no futuro", (value) => {
          if (!value || value.length !== 2) return false;
          const now = new Date();
          return value.every((date) => new Date(date) <= now);
        })
        .required("Campo obrigatório"),
    })
    .required();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const downloadPDFSummary = async (summary: AttendanceRecordSummary) => {
    const logoBase64 = await getBase64FromImageUrl(logo);

    const startDate = new Date(summary.startDate);
    startDate.setDate(startDate.getDate() + 1);
    const start = format(startDate, "dd/MM/yyyy");

    const endDate = new Date(summary.endDate);
    endDate.setDate(endDate.getDate() + 1);
    const end = format(endDate, "dd/MM/yyyy");

    // 1. Unir todas as datas do relatório
    const allDates = Array.from(
      new Set([
        ...summary.classReport.map((item) => item.date),
        ...summary.generalReport.map((item) => item.date),
      ])
    )
      .sort()
      .map((item) => format(parseISO(item), "dd/MM/yyyy"));

    // 2. Cabeçalho com colSpan/rowSpan (como já estava)
    const tableBody = [
      [
        {
          text: "Data",
          style: "tableHeader",
          rowSpan: 2,
          colSpan: 1,
          alignment: "center",
          margin: [0, 10, 0, 0],
        },
        {
          text: summary.class.name,
          style: "tableHeader",
          colSpan: 3,
          alignment: "center",
        },
        {},
        {},
        {
          text: "Todas as turmas",
          style: "tableHeader",
          colSpan: 3,
          alignment: "center",
        },
        {},
        {},
      ],
      [
        {}, // para "Data"
        { text: "Matriculados", style: "tableHeader", fontSize: 10 },
        { text: "Presentes", style: "tableHeader", fontSize: 10 },
        { text: "% Presente", style: "tableHeader", fontSize: 10 },
        { text: "Matriculados", style: "tableHeader", fontSize: 10 },
        { text: "Presentes", style: "tableHeader", fontSize: 10 },
        { text: "% Presente", style: "tableHeader", fontSize: 10 },
      ],
    ];

    // 3. Montar linhas com segurança para todas as datas
    allDates.forEach((date) => {
      const classItem = summary.classReport.find(
        (item) => format(parseISO(item.date), "dd/MM/yyyy") === date
      );
      const generalItem = summary.generalReport.find(
        (item) => format(parseISO(item.date), "dd/MM/yyyy") === date
      );

      const present = classItem?.presentCount ?? "-";
      const total = classItem?.total ?? "-";
      const percent =
        typeof present === "number" && typeof total === "number" && total > 0
          ? `${((present / total) * 100).toFixed(2)}%`
          : "-";

      const generalPresent = generalItem?.presentCount ?? "-";
      const generalTotal = generalItem?.total ?? "-";
      const generalPercent =
        typeof generalPresent === "number" &&
        typeof generalTotal === "number" &&
        generalTotal > 0
          ? `${((generalPresent / generalTotal) * 100).toFixed(2)}%`
          : "-";

      tableBody.push([
        { text: date, style: "tableCell", fontSize: 10 },
        { text: total.toString(), style: "tableCell", fontSize: 10 },
        { text: present.toString(), style: "tableCell", fontSize: 10 },
        { text: percent.toString(), style: "tableCell", fontSize: 10 },
        { text: generalTotal.toString(), style: "tableCell", fontSize: 10 },
        { text: generalPresent.toString(), style: "tableCell", fontSize: 10 },
        { text: generalPercent.toString(), style: "tableCell", fontSize: 10 },
      ]);
    });

    const docDefinition: TDocumentDefinitions = {
      pageOrientation: "landscape",
      content: [
        {
          text: `${summary.class.name} - Relatório de Frequência`,
          style: "header",
          fontSize: 16,
        },
        {
          text: `Período: ${start} até ${end}`,
          style: "subheader",
          fontSize: 12,
          marginBottom: 20,
        },
        {
          image: logoBase64,
          width: 150,
          alignment: "center",
          absolutePosition: { x: 650, y: 40 },
        },
        {
          style: "tableStyle",
          table: {
            widths: [100, "*", "*", "*", "*", "*", "*"],
            body: tableBody,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: {
          alignment: "center",
          bold: true,
          marginBottom: 10,
        },
        subheader: {
          alignment: "center",
          italics: true,
          marginBottom: 10,
        },
        tableHeader: {
          bold: true,
          fillColor: "#eeeeee",
          alignment: "center",
        },
        tableCell: {
          alignment: "center",
          margin: [0, 0, 0, 0],
          fontSize: 10,
        },
      },
    };

    const normalize = (text: string) =>
      text
        .normalize("NFD") // Remove acentos
        .replace(/[\u0300-\u036f]/g, "") // Remove caracteres combinados
        .replace(/[^a-zA-Z0-9]/g, "-") // Substitui caracteres especiais por hífen
        .replace(/-+/g, "-") // Remove múltiplos hífens seguidos
        .toLowerCase();

    const fileName = `relatorio-frequencia-${normalize(
      summary.class.name
    )}-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}`;

    downloadPDF(docDefinition, fileName);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSummary = (data: any) => {
    const id = toast.loading("Gerando relatório ... ");
    getSummary(classId, data.range[0] as Date, data.range[1] as Date, token)
      .then((summary) => {
        // console.log(summary);
        downloadPDFSummary(summary);
        toast.dismiss(id);
      })
      .catch((error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  useEffect(() => {
    register("range");
  }, [register]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md shadow-md"
    >
      <form
        onSubmit={handleSubmit(handleSummary)}
        className="w-full max-w-md mx-auto space-y-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="range"
            className="block text-sm font-medium text-gray-700"
          >
            Selecione o intervalo{" "}
            <span className="text-xs text-gray-400">(máx. 30 dias)</span>
          </label>

          <div className="relative">
            <FiCalendar className="absolute top-1.5 left-3 text-gray-500 pointer-events-none" />
            <Controller
              name="range"
              control={control}
              defaultValue={[start, end]}
              render={({ field }) => (
                <Calendar
                  id="range"
                  dateFormat="dd/mm/yy"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  selectionMode="range"
                  readOnlyInput
                  hideOnRangeSelection
                  className="w-full pl-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-400"
                  maxDate={new Date()}
                />
              )}
            />
          </div>

          {errors.range && (
            <p className="text-xs text-red font-medium text-wrap max-w-60">
              {errors.range.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-marine opacity-90 hover:opacity-100 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            Gerar Relatório
          </button>
        </div>
      </form>
    </ModalTemplate>
  );
}
