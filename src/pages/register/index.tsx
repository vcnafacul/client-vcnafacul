import { registerUser } from "@/services/auth/registerUser";
import { UserRegister } from "@/types/user/userRegister";
import { toast } from "react-toastify";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import GoogleAuthButton from "../../components/atoms/GoogleAuthButton";
import RegisterForm from "../../components/organisms/registerForm";
import BaseTemplate from "../../components/templates/baseTemplate";
import { registerForm } from "./data";

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
        <div className="flex flex-col items-center gap-3 mb-6 max-w-[500px] mx-auto px-4">
          <div className="w-full flex items-center gap-4">
            <hr className="flex-1 border-gray-300" />
            <span className="text-sm text-gray-500">ou cadastre-se com</span>
            <hr className="flex-1 border-gray-300" />
          </div>
          <GoogleAuthButton label="Cadastrar com Google" />
        </div>
      </div>
    </BaseTemplate>
  );
}

export default Register;
