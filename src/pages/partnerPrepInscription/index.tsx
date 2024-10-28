import StepperCircle, { StepCicle } from "@/components/atoms/stepperCirCle";
import Text from "@/components/atoms/text";
import BLink from "@/components/molecules/bLink";
import Button from "@/components/molecules/button";
import {
  LegalGuardianDTO,
  StudentInscriptionDTO,
} from "@/dtos/student/studentInscriptionDTO";
import { StepsInscriptionStudent } from "@/enums/prepCourse/stepInscriptionStudent";
import { DASH } from "@/routes/path";
import { hasActiveInscription } from "@/services/prepCourse/hasActiveInscription";
import { getUserInfo } from "@/services/prepCourse/student/getUserInfo";
import { completeInscriptionStudent } from "@/services/prepCourse/student/inscription";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BaseTemplate from "../../components/templates/baseTemplate";
import "../../styles/graphism.css";
import { SocioeconomicAnswer, stepDescriptions, textoParceria } from "./data";
import { PartnerPrepInscriptionStep0 } from "./steps/partnerPrepInscriptionStep0";
import { PartnerPrepInscriptionStep1 } from "./steps/partnerPrepInscriptionStep1";
import { PartnerPrepInscriptionStep2 } from "./steps/partnerPrepInscriptionStep2";
import { PartnerPrepInscriptionStep3 } from "./steps/partnerPrepInscriptionStep3";
import { PartnerPrepInscriptionStep4 } from "./steps/partnerPrepInscriptionStep4";
import { PartnerPrepInscriptionStepLogin } from "./steps/partnerPrepInscriptionStepLogin";
import { PartnerPrepInscriptionStepRegister } from "./steps/partnerPrepInscriptionStepRegister";
import { PartnerPrepInscriptionStepSucess } from "./steps/partnerPrepInscriptionStepSucess";

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
  const {
    data: { token },
  } = useAuthStore();
  const navigate = useNavigate();
  const [stepCurrently, setStepCurrently] = useState<StepsInscriptionStudent>(
    StepsInscriptionStudent.Blank
  );
  const [dataStudent, setDataStudent] = useState<StudentInscriptionDTO>(
    {} as StudentInscriptionDTO
  );
  const [prepCourseName, setPrepCourseName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { hashPrepCourse } = useParams();

  const backStep = () => {
    if (stepCurrently > StepsInscriptionStudent.Presentation) {
      if (
        dataStudent?.birthday &&
        !isMinor(dataStudent?.birthday) &&
        stepCurrently == StepsInscriptionStudent.Socioeconomic
      ) {
        setStepCurrently(StepsInscriptionStudent.Address);
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
      stepCurrently == StepsInscriptionStudent.Address
    ) {
      setStepCurrently(StepsInscriptionStudent.Socioeconomic);
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

  const completeInscription = (data: SocioeconomicAnswer[]) => {
    const id = toast.loading("Finalizando Inscrição ...");
    completeInscriptionStudent({ ...dataStudent, socioeconomic: data }, token)
      .then(() => {
        toast.dismiss(id);
        setStepCurrently(StepsInscriptionStudent.Success); // Redirect to success page
      })
      .catch((res) => {
        toast.update(id, {
          render: res.message,
          type: "error",
          isLoading: false,
        });
      });
  };

  const isMinor = (birthday: Date) => {
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
      name: stepDescriptions.step1,
      status:
        stepCurrently < StepsInscriptionStudent.PersonalInformation
          ? "upcoming"
          : stepCurrently == StepsInscriptionStudent.PersonalInformation
          ? "current"
          : "complete",
    },
    {
      name: stepDescriptions.step2,
      status:
        stepCurrently < StepsInscriptionStudent.Address
          ? "upcoming"
          : stepCurrently == StepsInscriptionStudent.Address
          ? "current"
          : "complete",
    },
    {
      name: stepDescriptions.step3,
      status:
        stepCurrently < StepsInscriptionStudent.LegalGuardian
          ? "upcoming"
          : stepCurrently == StepsInscriptionStudent.LegalGuardian
          ? "current"
          : "complete",
    },
    {
      name: stepDescriptions.step4,
      status:
        stepCurrently < StepsInscriptionStudent.Socioeconomic
          ? "upcoming"
          : stepCurrently == StepsInscriptionStudent.Socioeconomic
          ? "current"
          : "complete",
    },
  ];

  const StepCurrently = ({ step }: { step: number }) => {
    switch (step) {
      case StepsInscriptionStudent.RegisterUser:
        return (
          <PartnerPrepInscriptionStepRegister
            hashPrepCourse={hashPrepCourse as string}
          />
        );
      case StepsInscriptionStudent.Login:
        return (
          <PartnerPrepInscriptionStepLogin
            setStepCurrently={() =>
              setStepCurrently(StepsInscriptionStudent.RegisterUser)
            }
          />
        );
      case StepsInscriptionStudent.Error:
        return (
          <div className="flex flex-col items-center gap-4">
            <span className="text-lg text-center">{errorMessage}</span>
            <BLink to={DASH}>Página Inicial</BLink>
          </div>
        );
      case StepsInscriptionStudent.Presentation:
        return (
          <PartnerPrepInscriptionStep0
            description={textoParceria}
            start={() =>
              setStepCurrently(StepsInscriptionStudent.PersonalInformation)
            }
          />
        );
      case StepsInscriptionStudent.PersonalInformation:
        return (
          <PartnerPrepInscriptionStep1
            description={stepDescriptions.step1}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateData}
          />
        );
      case StepsInscriptionStudent.Address:
        return (
          <PartnerPrepInscriptionStep2
            description={stepDescriptions.step2}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateData}
          />
        );
      case StepsInscriptionStudent.LegalGuardian:
        return (
          <PartnerPrepInscriptionStep3
            description={stepDescriptions.step3}
            currentData={dataStudent}
            handleBack={backStep}
            updateData={updateDataGuardian}
          />
        );
      case StepsInscriptionStudent.Socioeconomic:
        return (
          <PartnerPrepInscriptionStep4
            description={stepDescriptions.step4}
            currentData={dataStudent}
            handleBack={backStep}
            updateSocioeconomic={completeInscription}
          />
        );
      case StepsInscriptionStudent.Success:
        return <PartnerPrepInscriptionStepSucess />;
      default:
        return <Button onClick={backStep}>Voltar</Button>;
    }
  };

  console.log("dataStudent", dataStudent);

  useEffect(() => {
    const element = document.getElementById("header");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stepCurrently]);

  useEffect(() => {
    if (!token) {
      setStepCurrently(StepsInscriptionStudent.RegisterUser);
    } else {
      if (!hashPrepCourse) navigate("/");
      hasActiveInscription(hashPrepCourse as string, token)
        .then((res) => {
          setDataStudent({
            ...dataStudent,
            partnerPrepCourse: hashPrepCourse as string,
          });
          setPrepCourseName(
            res.prepCourseName.toUpperCase().includes("CURSINHO")
              ? res.prepCourseName
              : `Cursinho ${res.prepCourseName}`
          );

          getUserInfo(hashPrepCourse as string, token)
            .then((res) => {
              setDataStudent({
                ...dataStudent,
                partnerPrepCourse: hashPrepCourse as string,
                firstName: res.firstName,
                lastName: res.lastName,
                socialName: res.socialName,
                whatsapp: res.phone,
                birthday: new Date(res.birthday),
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
              setStepCurrently(StepsInscriptionStudent.Presentation);
            })
            .catch((res) => {
              setStepCurrently(StepsInscriptionStudent.Error);
              setErrorMessage(res.message);
            });
        })
        .catch((res) => {
          setStepCurrently(StepsInscriptionStudent.Error);
          setErrorMessage(res.message);
        });
    }
  }, []);

  if (stepCurrently === StepsInscriptionStudent.Blank) return <></>;

  return (
    <div className="fixed">
      <BaseTemplate
        solid
        className="overflow-y-auto h-screen overflow-x-hidden relative"
      >
        {stepCurrently < StepsInscriptionStudent.Error ? (
          <StepCurrently step={stepCurrently} />
        ) : (
          <div className="flex flex-col justify-center items-center py-8 gap-8">
            <StepperCircle steps={steps} />
            <Text>{`Formulário de Inscrição ${prepCourseName}`}</Text>
            <div
              className={`w-11/12 ${
                stepCurrently === StepsInscriptionStudent.Presentation
                  ? "max-w-6xl"
                  : "sm:w-[500px]"
              }`}
            >
              <StepCurrently step={stepCurrently} />
            </div>
          </div>
        )}
      </BaseTemplate>
    </div>
  );
}
