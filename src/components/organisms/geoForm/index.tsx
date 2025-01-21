/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "react-toastify";
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
  form: FormFieldInput[]
}

export interface EachStepProps extends StepProps {
  updateData?: (data: any) => void;
  handleBack?: () => void;
  dataGeo?: CreateGeolocation;
}

export interface GeoFormProps {
  formData: {
      step1: StepProps,
      step2: StepProps,
      step3: StepProps,
      step4: StepProps,
      step5: StepProps,
      step6: StepProps,
  }
}

function GeoForm({ formData } : GeoFormProps){
  const [stepCurrently, setStepCurrently] = useState<number>(3)
  const [dataGeo, setDataGeo]= useState<CreateGeolocation>({} as CreateGeolocation)

  const updateData = (oldData: any) => {
    setDataGeo({...dataGeo, ...oldData})
    setStepCurrently(stepCurrently + 1)
  }

  const back = () => {
    if(stepCurrently > 0) {
      setStepCurrently(stepCurrently - 1)
    }
  }

  const completeRegisterGeo = (oldData: any) => {
    const id = toast.loading("Cadastrando o cursinho... ")
    const body = {...dataGeo, ...oldData}
    createGeolocation(body as CreateGeolocation)
      .then(_ => {
        toast.dismiss(id)
        setStepCurrently(6)
      })
      .catch((error: Error) => {
        toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
      })
  }

  const resetForm = () => {
    setStepCurrently(1)
    setDataGeo({} as CreateGeolocation)
  }

  const StepCurrently = ({ step } : { step: number}) => {
    switch (step) {
      case 2:
        return <Step2Geo {...formData.step2} updateData={updateData} handleBack={back} dataGeo={dataGeo} />
      case 3:
        return <Step3Geo {...formData.step3} updateData={updateData} handleBack={back} dataGeo={dataGeo} />
      case 4:
        return <Step4Geo {...formData.step4} updateData={updateData} handleBack={back} dataGeo={dataGeo} />
      case 5:
        return <Step5Geo {...formData.step5} updateData={completeRegisterGeo} handleBack={back} dataGeo={dataGeo} />
      case 6:
        return <Step6Geo {...formData.step6} reset={resetForm} />
      default:
        return <Step1Geo {...formData.step1} updateData={updateData} dataGeo={dataGeo} />
    }
  }

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-88px)] mb-3 px-4 mx-auto">
      <StepCurrently step={stepCurrently} />
    </div>
  )
}

export default GeoForm
