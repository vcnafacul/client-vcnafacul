import logo from "@/assets/images/logo_carteirinha.png";
import { AttendanceRecordSummaryByDate } from "@/dtos/attendanceRecord/attendanceRecordSummary";
import { downloadPDF } from "@/utils/get-pdf";
import { getBase64FromImageUrl } from "@/utils/getBase64FromImageUrl";
import { format, parseISO } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";

export const summaryByDate = async (summary: AttendanceRecordSummaryByDate) => {
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