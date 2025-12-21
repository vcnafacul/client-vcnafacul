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
      />
    ) : null;
  };

  return (
    <>
      <div
        onClick={handleOpenDetailsModal}
        className="group relative w-full bg-white border border-gray-200 rounded-2xl p-5 
                   shadow-sm hover:shadow-lg hover:border-blue-200 
                   transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Barra lateral colorida baseada no status */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition-all duration-300
            ${
              monitoring.status === StatusApplication.Enrolled
                ? "bg-green-500"
                : ""
            }
            ${
              monitoring.status === StatusApplication.UnderReview
                ? "bg-orange-400"
                : ""
            }
            ${
              monitoring.status === StatusApplication.Rejected
                ? "bg-red-500"
                : ""
            }
            ${
              monitoring.status === StatusApplication.DeclaredInterest
                ? "bg-blue-500"
                : ""
            }
            ${
              monitoring.status === StatusApplication.CalledForEnrollment
                ? "bg-emerald-500"
                : ""
            }
            ${
              monitoring.status === StatusApplication.MissedDeadline
                ? "bg-gray-400"
                : ""
            }
            ${
              monitoring.status === StatusApplication.EnrollmentNotConfirmed
                ? "bg-amber-500"
                : ""
            }
            ${
              monitoring.status === StatusApplication.EnrollmentCancelled
                ? "bg-red-600"
                : ""
            }
            ${
              monitoring.status === StatusApplication.SendedDocument
                ? "bg-blue-400"
                : ""
            }
            ${
              monitoring.status === StatusApplication.EnrollmentClosed
                ? "bg-indigo-600"
                : ""
            }
          `}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Informações principais */}
          <div className="flex-1 min-w-0 pl-2">
            <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">
              {monitoring.partnerCourseName}
            </h3>
            <p className="text-gray-500 text-sm mt-0.5 truncate">
              {monitoring.inscriptionName}
            </p>

            {/* Data e Status */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(monitoring.createdAt.toString(), "dd/MM/yyyy")}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                {getStatusIcon(monitoring.status)}
                <span className="text-sm font-medium text-gray-700">
                  {monitoring.status}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
            {monitoring.status === StatusApplication.Enrolled && (
              <button
                onClick={handleDownloadEnrollmentCertificate}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 min-w-[160px] px-4 py-2.5 
                           bg-blue-600 text-white text-sm font-medium rounded-lg 
                           hover:bg-blue-700 active:bg-blue-800 
                           disabled:bg-gray-400 disabled:cursor-not-allowed 
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
              className="flex items-center justify-center gap-2 min-w-[160px] px-4 py-2.5 
                         border border-gray-300 text-gray-700 text-sm font-medium rounded-lg 
                         hover:bg-gray-50 hover:border-gray-400 
                         transition-colors"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>Ver detalhes</span>
            </button>
          </div>
        </div>
      </div>

      <ModalDetails />
    </>
  );
}

// Mantém export com nome antigo para compatibilidade
export { CursinhoCard as CursinhoAccordion };
