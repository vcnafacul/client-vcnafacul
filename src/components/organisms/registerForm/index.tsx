import { useState } from "react";
import { UserRegister } from "../../../types/user/userRegister";
import Text from "../../atoms/text";
import Step1 from "./setps/step1";
import Step2 from "./setps/step2";
import Success from "./setps/success";

enum FormStep {
  STEP_EMAIL_PASSWORD = 1,
  STEP_USER_DATA = 2,
  SUCCESS_MESSAGE = 3
}

export interface StepProps {
  dataUser: UserRegister;
}
export interface RegisterFormProps {
  title: string;
  titleSuccess: string;
}

interface Props extends RegisterFormProps {
  onRegister: (data: UserRegister) => Promise<void>;
}

function RegisterForm({ title, titleSuccess, onRegister }: Props) {
  const [step, setStep] = useState<number>(FormStep.STEP_EMAIL_PASSWORD);
  const [dataUser, setDataUser] = useState<UserRegister>({} as UserRegister);

  const nextStep = () => {
    if (step < FormStep.SUCCESS_MESSAGE) {
      setStep(step + 1);
    }
  };

  const updateData = (oldData: UserRegister) => {
    setDataUser({ ...dataUser, ...oldData });
    nextStep();
  };

  const StepNow = () => {
    switch (step) {
      case FormStep.STEP_EMAIL_PASSWORD:
        return <Step1 updateData={updateData} dataUser={dataUser} />;
      case FormStep.STEP_USER_DATA:
        return (
          <Step2
            onRegister={onRegister}
            dataUser={dataUser}
            next={nextStep}
            back={() => setStep(FormStep.STEP_EMAIL_PASSWORD)}
          />
        );
      default:
        return <Success email={dataUser.email} />
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-88px)] mb-3 px-4 mx-auto py-10">
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
