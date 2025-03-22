import { StudentCard } from "@/components/molecules/studentCard";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getProfilePhoto } from "@/services/prepCourse/student/getProfilePhoto";
import { useAuthStore } from "@/store/auth";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import heic2any from "heic2any";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { FaFilePdf } from "react-icons/fa6";
import { Id, toast } from "react-toastify";

interface PrinterStudentCardsProps {
  isOpen: boolean;
  handleClose: () => void;
  entities: StudentsDtoOutput[];
}

export function PrinterStudentCards({
  isOpen,
  handleClose,
  entities,
}: PrinterStudentCardsProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Map<string, string>>(new Map());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [shouldGeneratePDF, setShouldGeneratePDF] = useState(false);
  const [toastId, setToastId] = useState<Id>();

  const {
    data: { token },
  } = useAuthStore();

  const generatePDF = async () => {
    const cards = document.querySelectorAll(".student-card");
    if (!cards.length) return;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 7;
    const cardWidth = (pageWidth - margin * 3) / 2;
    const cardHeight = 50;
    let xPos = margin;
    let yPos = margin;
    const chunkSize = 5; // Processa 5 elementos por vez
    const cardElements = Array.from(cards);
    const images: string[] = [];

    for (let i = 0; i < cardElements.length; i += chunkSize) {
      const chunk = cardElements.slice(i, i + chunkSize);
      const chunkImages = await Promise.all(
        chunk.map(async (card) => {
          const canvas = await html2canvas(card as HTMLElement, { scale: 2 });
          console.log(canvas);
          return canvas.toDataURL("image/png");
        })
      );
      images.push(...chunkImages);
    }
    images.forEach((imgData) => {
      pdf.addImage(imgData, "PNG", xPos, yPos, cardWidth, cardHeight);
      if (xPos === margin) {
        xPos += cardWidth + margin;
      } else {
        xPos = margin;
        yPos += cardHeight + margin;
      }
      if (yPos + cardHeight > pageHeight - margin) {
        pdf.addPage();
        xPos = margin;
        yPos = margin;
      }
    });
    // Gerar URL do PDF para visualização
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  const handleGeneratePDF = async () => {
    if (isGeneratingPDF) return;

    const id = toast.loading("Gerando PDF...");
    setToastId(id); // Salvar o ID do toast
    setIsGeneratingPDF(true);
    setShouldGeneratePDF(true); // Disparar o efeito que gera o PDF

    toast.update(id, {
      render: "Preparando PDF...",
      type: "info",
      isLoading: true,
      autoClose: false,
    });
  };

  useEffect(() => {
    new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
      if (!shouldGeneratePDF) return;
      generatePDF()
        .then(() => {
          toast.update(toastId!, {
            render: "PDF gerado com sucesso!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        })
        .catch((error) => {
          toast.update(toastId!, {
            render: "Erro ao gerar PDF: " + error.message,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        })
        .finally(() => {
          setIsGeneratingPDF(false);
          setShouldGeneratePDF(false); // Resetar flag
        });
    });
  }, [shouldGeneratePDF]);

  useEffect(() => {
    const newPhotoMap = new Map<string, string>();
    const id = toast.loading("Carregando fotos...");
    const fetchAllPhotos = async () => {
      setIsLoading(true);
      try {
        const fetchPhotos = entities
          .filter((entity) => entity.photo)
          .map(async (entity) => {
            try {
              const blob = await getProfilePhoto(entity.photo, token);
              const fileType = blob.type;
              const convertedBlob =
                fileType === "image/heic" || fileType === "image/heif"
                  ? ((await heic2any({ blob, toType: "image/jpeg" })) as Blob)
                  : blob;
              return {
                id: entity.photo,
                url: URL.createObjectURL(convertedBlob),
              };
            } catch (error) {
              console.error("Erro ao carregar a imagem:", error);
              return null;
            }
          });

        const results = await Promise.allSettled(fetchPhotos);

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            newPhotoMap.set(result.value.id, result.value.url);
          }
        });
        setPhotos(newPhotoMap);
      } catch (error) {
        console.error("Erro ao carregar todas as imagens:", error);
      } finally {
        setIsLoading(false);
        toast.dismiss(id);
      }
    };
    setIsLoading(false);
    fetchAllPhotos();

    // Cleanup para evitar vazamento de memória
    return () => {
      newPhotoMap.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [entities, token]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-screen h-screen bg-white p-4 overflow-y-auto scrollbar-hide"
    >
      <button
        onClick={handleGeneratePDF}
        className={`px-4 py-2 rounded-lg transition ${
          isLoading || isGeneratingPDF
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-redError text-white hover:bg-red"
        }`}
        disabled={isLoading || isGeneratingPDF}
      >
        <FaFilePdf className="h-6 w-6" />
      </button>

      {pdfUrl ? (
        <div className="mt-4">
          <iframe src={pdfUrl} className="w-full h-[calc(100vh-200px)]" />
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdfUrl;
              link.download = "carteirinhas.pdf";
              link.click();
            }}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700"
          >
            Baixar PDF
          </button>
        </div>
      ) : (
        <div className="flex justify-center flex-wrap gap-4">
          {entities.map((entity) => (
            <div className="bg-white p-2 shadow-lg" key={entity.id}>
              <StudentCard
                entity={entity}
                imageSrc={photos.get(entity.photo) || null}
              />
            </div>
          ))}
        </div>
      )}
    </ModalTemplate>
  );
}
