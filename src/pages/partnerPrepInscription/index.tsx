import StepperCircle, { StepCicle } from "@/components/atoms/stepperCirCle";
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import {
  LegalGuardianDTO,
  StudentInscriptionDTO,
} from "@/dtos/student/studentInscriptionDTO";
import { me } from "@/services/auth/me";
import { hasActiveInscription } from "@/services/prepCourse/hasActiveInscription";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BaseTemplate from "../../components/templates/baseTemplate";
import { formInscription, SocioeconomicAnswer } from "./data";
import { PartnerPrepInscriptionStep1 } from "./steps/partnerPrepInscriptionStep1";
import { PartnerPrepInscriptionStep2 } from "./steps/partnerPrepInscriptionStep2";
import { PartnerPrepInscriptionStep3 } from "./steps/partnerPrepInscriptionStep3";
import { PartnerPrepInscriptionStep4 } from "./steps/partnerPrepInscriptionStep4";

export interface StepProps {
  description: string;
}

export interface EachStepProps extends StepProps {
  updateData?: (
    data: Partial<StudentInscriptionDTO> | LegalGuardianDTO
  ) => void;
  handleBack?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSocioeconomic?: (data: SocioeconomicAnswer[]) => void;
  currentData?: Partial<StudentInscriptionDTO>;
}

export function PartnerPrepInscription() {
  const [firstTime, setFirstTime] = useState<boolean>(true);
  const [stepCurrently, setStepCurrently] = useState<number>(0);
  const [dataStudent, setDataStudent] = useState<StudentInscriptionDTO>(
    {} as StudentInscriptionDTO
  );

  const { hashPrepCourse } = useParams();
  const {
    data: { token },
  } = useAuthStore();
  const navigate = useNavigate();

  const backStep = () => {
    if (stepCurrently > 1) {
      if (
        dataStudent?.birthday &&
        !isMinor(dataStudent?.birthday) &&
        stepCurrently == 4
      ) {
        setStepCurrently(stepCurrently - 2);
        return;
      }
      setStepCurrently(stepCurrently - 1);
    }
  };

  const updateData = (
    data: Partial<StudentInscriptionDTO> | LegalGuardianDTO
  ) => {
    const newData = { ...dataStudent, ...data };
    setDataStudent(newData);
    if (
      newData?.birthday &&
      !isMinor(newData?.birthday) &&
      stepCurrently == 2
    ) {
      setStepCurrently(stepCurrently + 2);
      return;
    }
    setStepCurrently(stepCurrently + 1);
  };

  const updateDataGuardian = (
    data: Partial<StudentInscriptionDTO> | LegalGuardianDTO
  ) => {
    const getData = data as LegalGuardianDTO;
    setDataStudent({
      ...dataStudent,
      legalGuardian: {
        ...dataStudent.legalGuardian,
        fullName: getData.fullName,
        rg: getData.rg,
        uf: getData.uf,
        cpf: getData.cpf,
        phone: getData.phone,
      },
    });
    setStepCurrently(stepCurrently + 1);
  };

  const updateSocioeconomic = (data: SocioeconomicAnswer[]) => {
    setDataStudent({ ...dataStudent, socioeconomic: data });
  };

  const isMinor = (birthday: string) => {
    const age = calculateAge(new Date(birthday));
    return age < 18;
  };

  const calculateAge = (birthday: Date) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const steps: StepCicle[] = [
    {
      name: formInscription.steps.step1,
      status:
        stepCurrently < 1
          ? "upcoming"
          : stepCurrently == 1
          ? "current"
          : "complete",
    },
    {
      name: formInscription.steps.step2,
      status:
        stepCurrently < 2
          ? "upcoming"
          : stepCurrently == 2
          ? "current"
          : "complete",
    },
    {
      name: formInscription.steps.step3,
      status:
        stepCurrently < 3
          ? "upcoming"
          : stepCurrently == 3
          ? "current"
          : "complete",
    },
    {
      name: formInscription.steps.step4,
      status:
        stepCurrently < 4
          ? "upcoming"
          : stepCurrently == 4
          ? "current"
          : "complete",
    },
  ];

  const StepCurrently = ({ step }: { step: number }) => {
    switch (step) {
      case -1:
        return (
          <div>
            <Text size="secondary">Erro ao carregar formulário</Text>;
            <Button onClick={() => navigate("/")}>Voltar para Home</Button>
          </div>
        );
      case 0:
        return (
          <div>
            <Text size="secondary">{hashPrepCourse}</Text>
            <Button onClick={() => setStepCurrently(1)}>Iniciar</Button>
          </div>
        );
      case 1:
        return (
          <PartnerPrepInscriptionStep1
            description={formInscription.steps.step1}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateData}
          />
        );
      case 2:
        return (
          <PartnerPrepInscriptionStep2
            description={formInscription.steps.step2}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateData}
          />
        );
      case 3:
        return (
          <PartnerPrepInscriptionStep3
            description={formInscription.steps.step3}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateDataGuardian}
          />
        );
      case 4:
        return (
          <PartnerPrepInscriptionStep4
            description={formInscription.steps.step4}
            currentData={dataStudent}
            handleBack={backStep}
            updateSocioeconomic={updateSocioeconomic}
          />
        );
      default:
        return <Button onClick={backStep}>Voltar</Button>;
    }
  };

  useEffect(() => {
    const element = document.getElementById("header");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stepCurrently]);

  useEffect(() => {
    if (stepCurrently === 0) {
      if (!hashPrepCourse || !token) navigate("/");
      hasActiveInscription(hashPrepCourse as string, token)
        .then((res: boolean) => {
          if (res) {
            setDataStudent({
              ...dataStudent,
              partnerPrepCourse: hashPrepCourse as string,
            });
          } else {
            setStepCurrently(-1);
          }
        })
        .catch(() => {
          setStepCurrently(-1);
        });
    }
  }, []);

  useEffect(() => {
    if (firstTime && stepCurrently === 1) {
      me(token)
        .then((res) => {
          setDataStudent({
            ...dataStudent,
            firstName: res.firstName,
            lastName: res.lastName,
            socialname: res.socialName,
            whatsapp: res.phone,
            birthday: res.birthday,
            userId: res.id,
            street: res.street || "",
            number: res.number || 0,
            complement: res.complement || "",
            neighborhood: res.neighborhood || "",
            postalCode: res.postalCode || "",
            city: res.city,
            state: res.state,
            email: res.email,
          });
          setFirstTime(false);
        })
        .catch(() => {
          toast.error("Erro ao buscar informações do usuário");
          setStepCurrently(-1);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepCurrently]);

  return (
    <div className="fixed">
      <BaseTemplate
        solid
        className="overflow-y-auto h-screen overflow-x-hidden"
      >
        <div className="flex flex-col justify-center items-center py-8 gap-8">
          <StepperCircle steps={steps} />
          <div className="w-11/12 sm:w-[500px]">
            <Text size="secondary">
              Formulário de Inscrição Cursinho UFSCar
            </Text>
            <StepCurrently step={stepCurrently} />
          </div>
        </div>
      </BaseTemplate>
    </div>
  );
}
