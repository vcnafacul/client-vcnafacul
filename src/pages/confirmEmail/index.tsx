import { CreateFlow } from "@/enums/users/createFlow";
import {
  DASH,
  LOGIN_PATH,
  PARTNER_PREP,
  PARTNER_PREP_INSCRIPTION,
} from "@/routes/path";
import { confirmEmail } from "@/services/auth/confirmEmail";
import { jwtDecoded } from "@/utils/jwt";
import queryString from "query-string";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/auth";

export function ConfirmEmailPage() {
  const location = useLocation();
  const getToken = (queryString.parse(location.search).token as string) || "";

  const { doAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    confirmEmail(getToken)
      .then((res) => {
        toast.success("Obrigado por confirmar seu email");
        doAuth(res);
        const jsonToken = jwtDecoded(getToken);
        if (jsonToken.user.flow === CreateFlow.CREATE_STUDENT)
          navigate(
            `/${PARTNER_PREP}${PARTNER_PREP_INSCRIPTION}/${jsonToken.user.hashPrepCourse}`,
            { relative: "route" }
          );
        else navigate(DASH);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
        if (erro.message === "Email já validado") navigate(LOGIN_PATH);
      });
  }, [getToken]);

  return <></>;
}
