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
    <div>
      <TriangleGreen className="graphism triangle-green" />
      <TriangleYellow className="graphism triangle-yellow" />
      <RegisterForm
        title={registerForm.title}
        titleSuccess={registerForm.titleSuccess}
        onRegister={onRegister}
      />
    </div>
  );
}
