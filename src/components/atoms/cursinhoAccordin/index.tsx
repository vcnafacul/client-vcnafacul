import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { getEnrollmentCertificate } from "@/services/prepCourse/student/enrollmentCertificate";
import { useAuthStore } from "@/store/auth";
import { RegistrationMonitoring } from "@/types/partnerPrepCourse/registrationMonitoring";
import { formatDate } from "@/utils/date";
import Button from "@mui/material/Button";
import { useState } from "react";
import { getStatusIcon } from "../getStatusIcon";

interface CursinhoAccordionProps {
  monitoring: RegistrationMonitoring;
}

export function CursinhoAccordion({ monitoring }: CursinhoAccordionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadEnrollmentCertificate = async () => {
    setIsDownloading(true);
    getEnrollmentCertificate(monitoring.studentId, token).finally(() => {
      setIsDownloading(false);
    });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={monitoring.id}
        className="border rounded-xl shadow-sm transition hover:shadow-md"
      >
        {/* Cabeçalho */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">
              {monitoring.partnerCourseName}
            </span>
            <span className="font-normal text-gray-800">
              {monitoring.inscriptionName}
            </span>
          </div>
          <div className="w-px h-5 bg-gray-300 mx-2" />
          <span className="text-gray-500">
            Data de inscrição:{" "}
            <b>{formatDate(monitoring.createdAt.toString(), "dd/MM/yyyy")}</b>
          </span>

          <div className="w-px h-5 bg-gray-300 mx-2" />

          <span className="flex items-center gap-4">
            {monitoring.status} {getStatusIcon(monitoring.status)}
          </span>
        </div>
        {monitoring.status === StatusApplication.Enrolled && (
          <div className="flex justify-end px-4">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleDownloadEnrollmentCertificate}
              disabled={isDownloading}
            >
              {isDownloading ? "Baixando..." : "Declaração de Matrícula"}
            </Button>
          </div>
        )}

        {/* Trigger centralizado (substitui o botão manual) */}
        {monitoring.logs.length > 0 && (
          <AccordionTrigger className="flex justify-center text-gray-600 hover:text-gray-800 transition py-1" />
        )}

        {/* Conteúdo expandido */}
        <AccordionContent className="p-4 grid grid-cols-2 gap-2 text-sm">
          {monitoring.logs.map((log, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-2">
              <span className="text-gray-500">
                {formatDate(log.createdAt.toString(), "dd/MM/yyyy HH:mm:ss")}
              </span>
              <span className="text-blue-600">{log.description}</span>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
