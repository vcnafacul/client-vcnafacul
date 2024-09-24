import RegisterForm from "@/components/organisms/registerForm";
import { registerForm } from "@/pages/register/data";
import { registerUserFlowStudent } from "@/services/prepCourse/student/registerUserFlowStudent";
import { UserRegister } from "@/types/user/userRegister";
import { toast } from "react-toastify";
import { ReactComponent as TriangleGreen } from "../../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../../assets/icons/triangle-yellow.svg";
import "../../../styles/graphism.css";

interface Props {
  hashPrepCourse: string;
}

export function PartnerPrepInscriptionStepRegister({ hashPrepCourse }: Props) {
  const onRegister = async (data: UserRegister) => {
    const id = toast.loading("Cadastrando ... ");
    registerUserFlowStudent(data, hashPrepCourse as string)
      .then(() => {
        toast.update(id, {
          render: "Cadastro realizado com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };
  return (
    <div>
      <TriangleGreen className="graphism triangle-green" />
      <TriangleYellow className="graphism triangle-yellow" />
      <RegisterForm
        formData={registerForm.formData}
        title={registerForm.title}
        titleSuccess={registerForm.titleSuccess}
        onRegister={onRegister}
      />
    </div>
  );
}
