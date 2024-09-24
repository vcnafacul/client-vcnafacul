import { useState } from "react";
import { UserRegister } from "../../../types/user/userRegister";
import Text from "../../atoms/text";
import { FormFieldInput } from "../../molecules/formField";
import Step1 from "./setps/step1";
import Step2 from "./setps/step2";
import Success from "./setps/success";

export interface StepProps {
  formData: FormFieldInput[];
  dataUser: UserRegister;
}
export interface RegisterFormProps {
  title: string;
  titleSuccess: string;
  formData: {
    step1: FormFieldInput[];
    step2: FormFieldInput[];
  };
}

interface Props extends RegisterFormProps {
  onRegister: (data: UserRegister) => Promise<void>;
}

function RegisterForm({ title, titleSuccess, formData, onRegister }: Props) {
  const [step, setStep] = useState<number>(1);
  const [dataUser, setDataUser] = useState<UserRegister>({} as UserRegister);

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const updateData = (oldData: UserRegister) => {
    setDataUser({ ...dataUser, ...oldData });
    nextStep();
  };

  const StepNow = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            formData={formData.step1}
            updateData={updateData}
            dataUser={dataUser}
          />
        );
      case 2:
        return (
          <Step2
            onRegister={onRegister}
            formData={formData.step2}
            dataUser={dataUser}
            next={nextStep}
            back={() => setStep(1)}
          />
        );
      default:
        return <Success />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-88px)] mb-3 px-4 mx-auto py-10">
      <div className="mt-10 max-w-[500px] flex flex-col items-center w-full gap-y-4">
        {step < 3 ? (
          <Text size="secondary">{title}</Text>
        ) : (
          <Text>{titleSuccess}</Text>
        )}
        <StepNow />
      </div>
    </div>
  );
}

export default RegisterForm;
