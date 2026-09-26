import GoogleAuthButton from "@/components/atoms/googleAuthButton";
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
  /**
   * ⚠️ Cadastro pelo convite (card 05 de `convite-de-colaborador`): o email é
   * o do convite e não se troca — é o clique no link mandado a ele que
   * dispensa a confirmação de email.
   */
  emailTravado?: string;
  /**
   * "Cadastrar com Google" no topo do passo 1 (`login-com-google`). ⚠️ No topo,
   * e não depois do formulário: o formulário ocupa a tela inteira, e embaixo
   * o botão ficava fora da vista. Sem a prop, sem botão.
   */
  google?: { voltar?: string; convite?: string };
}

function RegisterForm({
  title,
  titleSuccess,
  onRegister,
  emailTravado,
  google,
}: Props) {
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
        return (
          <Step1
            updateData={updateData}
            dataUser={dataUser}
            emailTravado={emailTravado}
          />
        );
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
        {google && step === FormStep.STEP_EMAIL_PASSWORD && (
          <div data-google-no-topo className="flex w-full flex-col gap-4">
            <GoogleAuthButton
              label="Cadastrar com Google"
              voltar={google.voltar}
              convite={google.convite}
            />
            <div className="flex items-center gap-4" aria-hidden="true">
              <hr className="flex-1 border-grey/30" />
              <span className="text-sm text-grey">ou com email e senha</span>
              <hr className="flex-1 border-grey/30" />
            </div>
          </div>
        )}
        <StepNow />
      </div>
    </div>
  );
}

export default RegisterForm;
