import RegisterForm from "@/components/organisms/registerForm";
import { registerForm } from "@/pages/register/data";
import { registerUserFlowStudent } from "@/services/prepCourse/student/registerUserFlowStudent";
import { UserRegister } from "@/types/user/userRegister";
import { ReactComponent as TriangleGreen } from "../../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../../assets/icons/triangle-yellow.svg";
import "../../../styles/graphism.css";

interface Props {
  inscriptionId: string;
}

export function PartnerPrepInscriptionStepRegister({ inscriptionId }: Props) {
  const onRegister = async (data: UserRegister) => {
    registerUserFlowStudent(data, inscriptionId as string);
  };
  return (
    <div className="relative min-h-[calc(100vh-88px)] overflow-y-auto scrollbar-hide">
      <TriangleGreen className="graphism triangle-green" />
      <TriangleYellow className="absolute right-0 bottom-0 w-[63px] h-[63px] md:w-[135px] md:h-[135px] rotate-180 z-0 pointer-events-none" />
      <RegisterForm
        title={registerForm.title}
        titleSuccess={registerForm.titleSuccess}
        onRegister={onRegister}
      />
    </div>
  );
}
