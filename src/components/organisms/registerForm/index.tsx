import { useState } from "react";
import { UserRegister } from "../../../types/user/userRegister";
import Text from "../../atoms/text";
import Step1 from "./setps/step1";
import Step2 from "./setps/step2";
import Success from "./setps/success";

enum FormStep {
  FORM_LOGIN = 1,
  FORM_USER_DATA = 2,
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
  const [step, setStep] = useState<number>(FormStep.FORM_LOGIN);
  const [dataUser, setDataUser] = useState<UserRegister>({} as UserRegister);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  const nextStep = () => {
    if (step < FormStep.SUCCESS_MESSAGE) {
      setStep(step + 1);
    }
  };

  const updateData = (oldData: UserRegister) => {
    setDataUser({ ...dataUser, ...oldData });
    nextStep();
  };

  const handleRegister = (success: boolean) => {
    setRegistrationSuccess(success);
    if (success) {
      nextStep();
    } else {
      setStep(FormStep.FORM_USER_DATA);
    }
  }

  const StepNow = () => {
    switch (step) {
      case FormStep.FORM_LOGIN:
        return <Step1 updateData={updateData} dataUser={dataUser} />;
      case FormStep.FORM_USER_DATA:
        return (
          <Step2
            onRegister={onRegister}
            dataUser={dataUser}
            next={nextStep}
            back={() => setStep(FormStep.FORM_LOGIN)}
            handleRegister={handleRegister}
          />
        );        
      default:
        return registrationSuccess ? (
          <Success email={dataUser.email} />
        ) : (
          <Step2
            onRegister={onRegister}
            dataUser={dataUser}
            next={nextStep}
            back={() => setStep(FormStep.FORM_LOGIN)}
            handleRegister={handleRegister}
          />
        )
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
