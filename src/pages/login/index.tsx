import BaseTemplate from "../../components/templates/baseTemplate";
import "../../styles/graphism.css";

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import LoginForm from "../../components/organisms/loginForm";
import { DASH } from "../../routes/path";
import { useAuthStore } from "../../store/auth";
import { forgotRegister, loginForm } from "./data";

function Login() {
  const {
    data: { token },
  } = useAuthStore();
  const navigate = useNavigate();

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
    </BaseTemplate>
  );
}

export default Login;
