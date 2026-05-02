import { registerUser } from "@/services/auth/registerUser";
import { UserRegister } from "@/types/user/userRegister";
import { toast } from "react-toastify";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import RegisterForm from "../../components/organisms/registerForm";
import BaseTemplate from "../../components/templates/baseTemplate";
import googleAuth from "../../services/auth/googleAuth";
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
          <button
            type="button"
            onClick={googleAuth}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Cadastrar com Google</span>
          </button>
        </div>
      </div>
    </BaseTemplate>
  );
}

export default Register;
