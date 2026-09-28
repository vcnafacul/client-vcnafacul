/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToastAsync } from "@/hooks/useToastAsync";
import { useState } from "react";
import { createGeolocation } from "../../../services/geolocation/createGeolocation";
import { CreateGeolocation } from "../../../types/geolocation/geolocation";
import { FormFieldInput } from "../../molecules/formField";
import Step1Geo from "./steps/step1";
import Step2Geo from "./steps/step2";
import Step3Geo from "./steps/step3";
import Step4Geo from "./steps/step4";
import Step5Geo from "./steps/step5";
import Step6Geo from "./steps/step6";

export interface StepProps {
  title: string;
  subtitle: string;
  form: FormFieldInput[];
}

export interface EachStepProps extends StepProps {
  updateData?: (data: any) => void;
  /** Recebe o que já foi digitado na etapa, para não perder ao voltar. */
  handleBack?: (data?: any) => void;
  dataGeo?: CreateGeolocation;
}

export interface GeoFormProps {
  /** Nome do cursinho já preenchido (vem da busca do Localiza Cursinho, card 08). */
  nomeInicial?: string;
  formData: {
    step1: StepProps;
    step2: StepProps;
    step3: StepProps;
    step4: StepProps;
    step5: StepProps;
    step6: StepProps;
  };
}

// Dados Pessoais por último (tickets/022, card 11): a pessoa começa falando do cursinho.
enum Step {
  CourseData,
  Address,
  Contact,
  SocialMedia,
  PersonalData,
  Finish,
}

function GeoForm({ formData, nomeInicial }: GeoFormProps) {
  const [stepCurrently, setStepCurrently] = useState<number>(Step.CourseData);
  const [dataGeo, setDataGeo] = useState<CreateGeolocation>(
    () => (nomeInicial ? { name: nomeInicial } : {}) as CreateGeolocation,
  );

  const executeAsync = useToastAsync();

  const updateData = (oldData: any) => {
    setDataGeo({ ...dataGeo, ...oldData });
    setStepCurrently(stepCurrently + 1);
  };

  const back = (dadosDaEtapa?: any) => {
    if (dadosDaEtapa) setDataGeo({ ...dataGeo, ...dadosDaEtapa });
    if (stepCurrently > 0) {
      setStepCurrently(stepCurrently - 1);
    }
  };

  const completeRegisterGeo = async (oldData: any) => {
    await executeAsync({
      action: async () => {
        return await createGeolocation({ ...dataGeo, ...oldData });
      },
      loadingMessage: "Cadastrando o cursinho... ",
      successMessage: "Cursinho cadastrado com sucesso!",
      errorMessage: "Erro ao cadastrar o cursinho",
      onSuccess: () => {
        setStepCurrently(Step.Finish);
      },
    });
  };

  const resetForm = () => {
    setStepCurrently(Step.CourseData);
    setDataGeo({} as CreateGeolocation);
  };

  const StepCurrently = ({ step }: { step: number }) => {
    switch (step) {
      case Step.Address:
        return (
          <Step3Geo
            {...formData.step3}
            updateData={updateData}
            handleBack={back}
            dataGeo={dataGeo}
          />
        );
      case Step.Contact:
        return (
          <Step4Geo
            {...formData.step4}
            updateData={updateData}
            handleBack={back}
            dataGeo={dataGeo}
          />
        );
      case Step.SocialMedia:
        return (
          <Step5Geo
            {...formData.step5}
            updateData={updateData}
            handleBack={back}
            dataGeo={dataGeo}
          />
        );
      case Step.Finish:
        return <Step6Geo {...formData.step6} reset={resetForm} />;
      case Step.PersonalData:
        return (
          <Step1Geo
            {...formData.step1}
            updateData={completeRegisterGeo}
            handleBack={back}
            dataGeo={dataGeo}
          />
        );
      default:
        return (
          <Step2Geo
            {...formData.step2}
            updateData={updateData}
            dataGeo={dataGeo}
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-88px)] mb-3 px-4 mx-auto">
      <StepCurrently step={stepCurrently} />
    </div>
  );
}

export default GeoForm;
