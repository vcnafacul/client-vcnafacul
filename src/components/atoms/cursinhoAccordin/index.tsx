import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { Details } from "@/pages/partnerPrepInscritionStudentManager/modal/details";
import { getEnrollmentCertificate } from "@/services/prepCourse/student/enrollmentCertificate";
import { getDetailed } from "@/services/prepCourse/student/getDetailed";
import { useAuthStore } from "@/store/auth";
import { RegistrationMonitoring } from "@/types/partnerPrepCourse/registrationMonitoring";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import { formatDate } from "@/utils/date";
import { Calendar, Download, FileText } from "lucide-react";
import { useState } from "react";
import { getStatusIcon } from "../getStatusIcon";
import { Link } from "react-router-dom";
import { DECLARED_INTEREST } from "@/routes/path";

interface CursinhoCardProps {
  monitoring: RegistrationMonitoring;
}

export function CursinhoCard({ monitoring }: CursinhoCardProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const modals = useModals(["details"]);
  const [studentDetails, setStudentDetails] = useState<
    XLSXStudentCourseFull | undefined
  >(undefined);
  const executeAsync = useToastAsync();

  const handleDownloadEnrollmentCertificate = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setIsDownloading(true);
    getEnrollmentCertificate(monitoring.studentId, token).finally(() => {
      setIsDownloading(false);
    });
  };

  const handleOpenDetailsModal = async () => {
    await executeAsync({
      action: async () => await getDetailed(monitoring.studentId, token),
      loadingMessage: "Buscando detalhes do estudante...",
      successMessage: () => "Detalhes do estudante buscados com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res: XLSXStudentCourseFull) => {
        setStudentDetails(res);
        modals.details.open();
      },
    });
  };

  const ModalDetails = () => {
    return modals.details.isOpen ? (
      <Details
        handleClose={modals.details.close}
        student={studentDetails!}
        disableDocuments
        disableLogs
      />
    ) : null;
  };

  return (
    <>
      <div
        onClick={handleOpenDetailsModal}
        className="group relative w-full bg-white border border-border rounded-2xl p-5 
                   shadow-sm hover:shadow-lg hover:border-info 
                   transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Barra lateral colorida baseada no status */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition-all duration-300
            ${
              monitoring.status === StatusApplication.Enrolled
                ? "bg-success"
                : ""
            }
            ${
              monitoring.status === StatusApplication.UnderReview
                ? "bg-warning"
                : ""
            }
            ${
              monitoring.status === StatusApplication.Rejected
                ? "bg-destructive"
                : ""
            }
            ${
              monitoring.status === StatusApplication.DeclaredInterest
                ? "bg-info"
                : ""
            }
            ${
              monitoring.status === StatusApplication.CalledForEnrollment
                ? "bg-success"
                : ""
            }
            ${
              monitoring.status === StatusApplication.MissedDeadline
                ? "bg-muted-foreground"
                : ""
            }
            ${
              monitoring.status === StatusApplication.EnrollmentNotConfirmed
                ? "bg-warning"
                : ""
            }
            ${
              monitoring.status === StatusApplication.EnrollmentCancelled
                ? "bg-destructive"
                : ""
            }
            ${
              monitoring.status === StatusApplication.SendedDocument
                ? "bg-info"
                : ""
            }
            ${
              monitoring.status === StatusApplication.EnrollmentClosed
                ? "bg-primary"
                : ""
            }
          `}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Informações principais */}
          <div className="flex-1 min-w-0 pl-2">
            <h3 className="font-semibold text-foreground text-h3 truncate group-hover:text-primary transition-colors">
              {monitoring.partnerCourseName}
            </h3>
            <p className="text-muted-foreground text-body mt-0.5 truncate">
              {monitoring.inscriptionName}
            </p>

            {/* Data e Status */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-body">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(monitoring.createdAt.toString(), "dd/MM/yyyy")}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-page rounded-full">
                {getStatusIcon(monitoring.status)}
                <span className="text-body font-medium text-foreground">
                  {monitoring.status}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          {/* Sempre em coluna: no celular, lado a lado, dois botões de 160px
              passavam da borda do card. */}
          <div className="flex flex-col items-stretch gap-2">
            {monitoring.status === StatusApplication.Enrolled && (
              <button
                onClick={handleDownloadEnrollmentCertificate}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 sm:min-w-[160px] px-4 py-2.5 
                           bg-primary text-primary-foreground text-body font-medium rounded-lg 
                           hover:bg-primary/90 active:bg-primary/80 
                           disabled:bg-muted-foreground disabled:cursor-not-allowed 
                           transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span>{isDownloading ? "Baixando..." : "Declaração"}</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetailsModal();
              }}
              className="flex items-center justify-center gap-2 sm:min-w-[160px] px-4 py-2.5 
                         border border-border text-foreground text-body font-medium rounded-lg 
                         hover:bg-page hover:border-input 
                         transition-colors"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>Ver detalhes</span>
            </button>
            {monitoring.status === StatusApplication.CalledForEnrollment && (
              <Link
                to={`/${DECLARED_INTEREST}/${monitoring.inscriptionId}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 sm:min-w-[160px] px-4 py-2.5 
                           bg-success/80 text-success-foreground text-body font-medium rounded-lg 
                           hover:bg-success 
                           transition-colors shadow-sm"
              >
                Declarar interesse
              </Link>
            )}
          </div>
        </div>
      </div>

      {ModalDetails()}
    </>
  );
}

// Mantém export com nome antigo para compatibilidade
export { CursinhoCard as CursinhoAccordion };
