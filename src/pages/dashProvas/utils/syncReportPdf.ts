import { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import { SyncReport, FixDetail } from "../../../dtos/prova/syncReport";
import { downloadPDF } from "../../../utils/get-pdf";

function formatFixesTable(
    title: string,
    items: { nome: string; fixes: FixDetail[] }[]
): Content[] {
    if (items.length === 0) return [];

    const rows: any[][] = [
        [
            { text: "Nome", bold: true },
            { text: "Campo", bold: true },
            { text: "Problema", bold: true },
            { text: "Valor Antigo", bold: true },
            { text: "Valor Novo", bold: true },
        ],
    ];

    for (const item of items) {
        for (const fix of item.fixes) {
            rows.push([
                item.nome,
                fix.field,
                fix.detail || fix.issue,
                String(fix.oldValue),
                String(fix.newValue),
            ]);
        }
    }

    return [
        { text: title, style: "sectionHeader", margin: [0, 15, 0, 5] } as Content,
        {
            table: {
                headerRows: 1,
                widths: ["*", "auto", "*", "auto", "auto"],
                body: rows,
            },
            layout: "lightHorizontalLines",
        } as Content,
    ];
}

export function downloadSyncReportPdf(report: SyncReport) {
    const statusLabel: Record<string, string> = {
        idle: "Nenhuma sincronizacao realizada",
        processing: "Em andamento",
        completed: "Concluida",
        error: "Erro",
    };

    const content: Content[] = [
        { text: "Relatorio de Sincronizacao de Provas", style: "header" },
        {
            text: `Data: ${report.processedAt ? new Date(report.processedAt).toLocaleString("pt-BR") : "N/A"}`,
            margin: [0, 5, 0, 5],
        },
        {
            text: `Status: ${statusLabel[report.status] || report.status}`,
            margin: [0, 0, 0, 5],
        },
        {
            text: `Total de provas processadas: ${report.totalProvas}`,
            margin: [0, 0, 0, 5],
        },
        {
            text: `Provas corrigidas: ${report.provasFixed.length}  |  Simulados corrigidos: ${report.simuladosFixed.length}  |  Erros: ${report.errors.length}`,
            margin: [0, 0, 0, 10],
        },
    ];

    content.push(
        ...formatFixesTable(
            "Provas Corrigidas",
            report.provasFixed.map((p) => ({ nome: p.provaNome, fixes: p.fixes }))
        )
    );

    content.push(
        ...formatFixesTable(
            "Simulados Corrigidos",
            report.simuladosFixed.map((s) => ({ nome: s.simuladoNome, fixes: s.fixes }))
        )
    );

    if (report.errors.length > 0) {
        const errorRows: any[][] = [
            [
                { text: "Prova", bold: true },
                { text: "Erro", bold: true },
            ],
        ];
        for (const err of report.errors) {
            errorRows.push([err.provaNome || err.provaId || "Geral", err.error]);
        }

        content.push(
            { text: "Erros", style: "sectionHeader", margin: [0, 15, 0, 5] } as Content,
            {
                table: {
                    headerRows: 1,
                    widths: ["auto", "*"],
                    body: errorRows,
                },
                layout: "lightHorizontalLines",
            } as Content
        );
    }

    if (
        report.provasFixed.length === 0 &&
        report.simuladosFixed.length === 0 &&
        report.errors.length === 0
    ) {
        content.push({
            text: "Nenhuma correcao necessaria. Todas as provas estao consistentes.",
            margin: [0, 15, 0, 0],
            italics: true,
        });
    }

    const docDefinition: TDocumentDefinitions = {
        content,
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            sectionHeader: { fontSize: 14, bold: true },
        },
    };

    downloadPDF(docDefinition, `relatorio-sync-${new Date().toISOString().slice(0, 10)}`);
}
