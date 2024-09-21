import StepperCircle, { StepCicle } from "@/components/atoms/stepperCirCle";
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import { StudentInscriptionDTO } from "@/dtos/student/studentInscriptionDTO";
import { useState } from "react";
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
  updateData?: (data: Partial<StudentInscriptionDTO>) => void;
  handleBack?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSocioeconomic?: (data: SocioeconomicAnswer[]) => void;
  currentData?: Partial<StudentInscriptionDTO>;
}

export function PartnerPrepInscription() {
  const [stepCurrently, setStepCurrently] = useState<number>(3);
  const [dataStudent, setDataStudent] = useState<StudentInscriptionDTO>(
    {} as StudentInscriptionDTO
  );

  const backStep = () => {
    if (stepCurrently > 0) {
      if (
        dataStudent?.birthday &&
        !isMinor(dataStudent?.birthday) &&
        stepCurrently == 3
      ) {
        setStepCurrently(stepCurrently - 2);
        return;
      }
      setStepCurrently(stepCurrently - 1);
    }
  };

  const updateData = (oldData: Partial<StudentInscriptionDTO>) => {
    const newData = { ...dataStudent, ...oldData };
    setDataStudent(newData);
    if (
      newData?.birthday &&
      !isMinor(newData?.birthday) &&
      stepCurrently == 1
    ) {
      setStepCurrently(stepCurrently + 2);
      return;
    }
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
      status: stepCurrently == 0 ? "current" : "complete",
    },
    {
      name: formInscription.steps.step2,
      status:
        stepCurrently < 1
          ? "upcoming"
          : stepCurrently == 1
          ? "current"
          : "complete",
    },
    {
      name: formInscription.steps.step3,
      status:
        stepCurrently < 2
          ? "upcoming"
          : stepCurrently == 2
          ? "current"
          : "complete",
    },
    {
      name: formInscription.steps.step4,
      status:
        stepCurrently < 3
          ? "upcoming"
          : stepCurrently == 3
          ? "current"
          : "complete",
    },
  ];

  const StepCurrently = ({ step }: { step: number }) => {
    switch (step) {
      case 0:
        return (
          <PartnerPrepInscriptionStep1
            description={formInscription.steps.step1}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateData}
          />
        );
      case 1:
        return (
          <PartnerPrepInscriptionStep2
            description={formInscription.steps.step2}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateData}
          />
        );
      case 2:
        return (
          <PartnerPrepInscriptionStep3
            description={formInscription.steps.step3}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateData}
          />
        );
      case 3:
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
  return (
    <div className="fixed">
      <BaseTemplate
        solid
        className="overflow-y-auto scrollbar-hide h-screen overflow-x-hidden"
      >
        <div className="flex flex-col justify-center items-center mt-16 gap-8">
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
