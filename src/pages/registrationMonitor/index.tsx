import { CursinhoAccordion } from "@/components/atoms/cursinhoAccordin";
import { getRegistrationMonitoring } from "@/services/prepCourse/student/getRegistrionMonitoring";
import { useAuthStore } from "@/store/auth";
import { RegistrationMonitoring } from "@/types/partnerPrepCourse/registrationMonitoring";
import { useEffect, useState } from "react";

export default function RegistrationMonitor() {
  const [registrationMonitoring, setRegistrationMonitoring] = useState<
    RegistrationMonitoring[]
  >([]);

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    getRegistrationMonitoring(token).then((res) => {
      setRegistrationMonitoring(res);
    });
  }, [token]);

  return (
    <div className="p-4">
      <div className="mb-10">
        <div className="text-h1 font-extrabold text-foreground">
          Acompanhamento de Inscrições
        </div>
        <div className="text-h2 font-normal text-foreground mb-6">
          Acompanhe aqui suas inscrições realizadas.
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {registrationMonitoring.map((registration) => (
          <CursinhoAccordion key={registration.id} monitoring={registration} />
        ))}
      </div>
    </div>
  );
}
