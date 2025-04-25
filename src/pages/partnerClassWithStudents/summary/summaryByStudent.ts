import logo from "@/assets/images/logo_carteirinha.png";
import { AttendanceRecordSummaryByStudent } from "@/dtos/attendanceRecord/attendanceRecordSummary";
import { downloadPDF } from "@/utils/get-pdf";
import { getBase64FromImageUrl } from "@/utils/getBase64FromImageUrl";
import { format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";

export const summaryByStudent = async (summary: AttendanceRecordSummaryByStudent) => {
  const logoBase64 = await getBase64FromImageUrl(logo);

  const start = format(new Date(summary.startDate), "dd/MM/yyyy");
  const end = format(new Date(summary.endDate), "dd/MM/yyyy");

  // 1. Cabeçalho da tabela
  const tableBody = [
    [
      { text: "Nome do Estudante", style: "tableHeader" },
      { text: "Código de Matrícula", style: "tableHeader" },
      { text: "Total de Registros", style: "tableHeader" },
      { text: "Presenças", style: "tableHeader" },
      { text: "% Presença", style: "tableHeader" },
    ],
  ];

  // 2. Linhas dos estudantes
  summary.report.forEach((student) => {
    tableBody.push([
      { text: student.studentName || "-", style: "tableCell",},
      { text: student.codEnrolled || "-", style: "tableCell",},
      { text: student.totalClassRecords.toString(), style: "tableCell",},
      { text: student.studentRecords.toString(), style: "tableCell",},
      {
        text: `${student.presencePercentage}%`,
        style: "tableCell",
      },
    ]);
  });

  const docDefinition: TDocumentDefinitions = {
    pageOrientation: "landscape",
    content: [
      {
        text: `${summary.class.name} - Relatório de Frequência por Estudante`,
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
          widths: ["*", "*", "*", "*", "*"],
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
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

  const fileName = `relatorio-frequencia-estudante-${normalize(
    summary.class.name
  )}-${format(new Date(summary.startDate), "yyyy-MM-dd")}-${format(new Date(summary.endDate), "yyyy-MM-dd")}`;

  downloadPDF(docDefinition, fileName);
};
