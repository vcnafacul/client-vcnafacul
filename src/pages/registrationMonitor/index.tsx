import { PageHeader, PageShell } from "@/components/ui/page-header";
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
    <PageShell>
      <PageHeader
        title="Acompanhamento de Inscrições"
        subtitle="Acompanhe aqui suas inscrições realizadas."
      />
      <div className="flex flex-col gap-2">
        {registrationMonitoring.map((registration) => (
          <CursinhoAccordion key={registration.id} monitoring={registration} />
        ))}
      </div>
    </PageShell>
  );
}
