import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import { TDocumentDefinitions } from "pdfmake/interfaces";


pdfMake.vfs = pdfFonts as unknown as { [file: string]: string };

export const downloadPDF = (documentDefinitions: TDocumentDefinitions, nameFile: string) => {
    return pdfMake
      .createPdf(documentDefinitions)
      .download(`${nameFile}.pdf`);
  };