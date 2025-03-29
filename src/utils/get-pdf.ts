import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import { TDocumentDefinitions } from "pdfmake/interfaces";


pdfMake.vfs = pdfFonts as unknown as { [file: string]: string };

export const downloadPDF = (documentDefinitions: TDocumentDefinitions, nameFile: string) => {
    const datet = new Date();
    const date = format(datet, "dd/MM/yyyy HH:mm");
    return pdfMake
      .createPdf(documentDefinitions)
      .download(`${nameFile}-${date}.pdf`);
  };