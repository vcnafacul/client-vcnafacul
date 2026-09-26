import BaseTemplate from "../../components/templates/baseTemplate";
import "../../styles/graphism.css";

import EntrarComGoogle from "@/components/molecules/entrarComGoogle";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import LoginForm from "../../components/organisms/loginForm";
import { DASH } from "../../routes/path";
import { useAuthStore } from "../../store/auth";
import { forgotRegister, loginForm } from "./data";

/** Os `?erro=` com que a api devolve do Google (card 01 de `login-com-google`). */
// eslint-disable-next-line react-refresh/only-export-components
export const ERROS_DO_GOOGLE: Record<string, string> = {
  google: "Não foi possível entrar com o Google. Tente de novo.",
  "conta-removida": "Esta conta foi removida.",
};

function Login() {
  const {
    data: { token },
  } = useAuthStore();
  const navigate = useNavigate();
  const erroDoGoogle = new URLSearchParams(useLocation().search).get("erro");

  useEffect(() => {
    if (erroDoGoogle) {
      toast.error(ERROS_DO_GOOGLE[erroDoGoogle] ?? ERROS_DO_GOOGLE.google, {
        toastId: `google-${erroDoGoogle}`,
      });
    }
  }, [erroDoGoogle]);

  useEffect(() => {
    if (token) {
      navigate(DASH);
    }
  }, [navigate, token]);

  return (
    <BaseTemplate
      solid={true}
      className="bg-white overflow-y-auto scrollbar-hide h-screen relative"
    >
      <TriangleGreen className="graphism triangle-green" />
      <TriangleYellow className="graphism triangle-yellow" />
      <LoginForm {...loginForm} />
      <div className="flex mx-auto px-4 justify-between max-w-[500px] w-full">
        {forgotRegister.map(({ label, link }) => (
          <Link
            key={link}
            to={link}
            className="text-orange w-fit underline font-bold"
          >
            {label}
          </Link>
        ))}
      </div>
      <EntrarComGoogle label="Entrar com Google" />
    </BaseTemplate>
  );
}

export default Login;
