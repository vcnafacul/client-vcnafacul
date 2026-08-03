import GoogleAuthButton from "@/components/atoms/GoogleAuthButton";
import LoginForm from "@/components/organisms/loginForm";
import { loginForm } from "@/pages/login/data";
import { FORGOT_PASSWORD_PATH } from "@/routes/path";
import { Link } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import "../../styles/graphism.css";

export function ConfirmEnrolledLogin() {
  return (
    <div>
      <TriangleGreen className="graphism triangle-green" />
      <TriangleYellow className="graphism triangle-yellow" />
      <LoginForm {...loginForm} onLogin={() => {}} />
      <div className="flex mx-auto px-4 justify-between max-w-[500px] w-full">
        <Link
          to={FORGOT_PASSWORD_PATH}
          className="text-orange w-fit underline font-bold"
        >
          Esqueci minha senha
        </Link>
      </div>
      <div className="flex mx-auto px-4 items-center gap-4 my-2 max-w-[500px] w-full">
        <hr className="flex-1 border-gray-300" />
        <span className="text-sm text-gray-500">ou</span>
        <hr className="flex-1 border-gray-300" />
      </div>
      <div className="flex mx-auto px-4 max-w-[500px] w-full">
        <GoogleAuthButton label="Entrar com Google" />
      </div>
    </div>
  );
}
