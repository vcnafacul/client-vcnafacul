import { registerUser } from "@/services/auth/registerUser";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import RegisterForm from "../../components/organisms/registerForm";
import BaseTemplate from "../../components/templates/baseTemplate";
import { registerForm } from "./data";
import { UserRegister } from "@/types/user/userRegister";
import { toast } from "react-toastify";

function Register() {
  const onRegister = async (data: UserRegister) => {
    return registerUser(data)
      .then(() => {
        toast.success("Cadastro realizado com sucesso");
      })
      .catch((error: Error) => {
        toast.error(error.message);
        throw error;
      });
  };
  
  return (
    <BaseTemplate
      solid
      className="bg-white overflow-y-auto scrollbar-hide h-screen"
    >
      <div className="relative py-4">
        <TriangleGreen className="graphism triangle-green" />
        <TriangleYellow className="graphism triangle-yellow" />
        <RegisterForm
          title={registerForm.title}
          titleSuccess={registerForm.titleSuccess}
          onRegister={onRegister}
        />
      </div>
    </BaseTemplate>
  );
}

export default Register;
