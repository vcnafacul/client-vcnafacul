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
        <div className="text-4xl font-extrabold text-marine">
          Acompanhamento de Inscrições
        </div>
        <div className="text-xl font-normal text-marine mb-6">
          Acompanhe aqui suas inscrições realizadas.
        </div>
      </div>
      {registrationMonitoring.map((registration) => (
        <CursinhoAccordion key={registration.id} monitoring={registration} />
      ))}
    </div>
  );
}
