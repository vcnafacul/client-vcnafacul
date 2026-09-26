import EntrarComGoogle from "@/components/molecules/entrarComGoogle";
import LoginForm from "@/components/organisms/loginForm";
import { useCaminhoAtual } from "@/hooks/useCaminhoAtual";
import { loginForm } from "@/pages/login/data";
import { FORGOT_PASSWORD_PATH } from "@/routes/path";
import { Link } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import "../../styles/graphism.css";

export function ConfirmEnrolledLogin() {
  // ⚠️ A página troca o login pela confirmação assim que há sessão
  const voltar = useCaminhoAtual();
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
      <EntrarComGoogle label="Entrar com Google" voltar={voltar} />
    </div>
  );
}
