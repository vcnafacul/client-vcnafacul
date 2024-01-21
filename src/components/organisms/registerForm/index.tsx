import Text from "../../atoms/text"
import { FormFieldInput } from "../../molecules/formField";
import Step1 from "./setps/step1";
import { useState } from "react";
import Step2 from "./setps/step2";
import Sucess from "./setps/sucess";
import { UserRegister } from "../../../types/user/userRegister";


export interface StepProps {
    formData: FormFieldInput[];
    dataUser: UserRegister
}
export interface RegisterFormProps {
    title: string;
    titleSucess: string;
    formData: {
        step1: FormFieldInput[],
        step2: FormFieldInput[]
    }
}

function RegisterForm({ title, titleSucess, formData } : RegisterFormProps){
    const [step, setStep] = useState<number>(1)
    const [dataUser, setDataUser] = useState<UserRegister>({} as UserRegister)

    const nextStep = () => {
        if(step < 3){
            setStep(step + 1)
        }
    }

    const updateData = (oldData: UserRegister) => {
        setDataUser({...dataUser, ...oldData})
        nextStep()
      }

    const StepNow = () => {
        switch (step) {
            case 1:
                return <Step1 formData={formData.step1} updateData={updateData} dataUser={dataUser} />
            case 2:
                return <Step2 formData={formData.step2} dataUser={dataUser} next={nextStep} back={() => setStep(1)} />
            default:
                return <Sucess  />
        }
    }

    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
             <div className="mt-10 max-w-[500px] flex flex-col items-center w-full gap-y-4">
                {step < 3 ? <Text size="secondary">{title}</Text> : <Text>{titleSucess}</Text>}
                <StepNow />
            </div>
        </div>
    )
}

export default RegisterForm