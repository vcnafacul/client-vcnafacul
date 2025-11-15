import { CreateFlow } from "@/enums/users/createFlow";
import { useToastAsync } from "@/hooks/useToastAsync";
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

  const executeAsync = useToastAsync();

  const handleConfirmEmail = async () => {
    await executeAsync({
      action: () => confirmEmail(getToken),
      loadingMessage: "Confirmando email...",
      successMessage: "Email confirmado com sucesso",
      errorMessage: "Erro ao confirmar email",
      onSuccess: (res) => {
        toast.success("Obrigado por confirmar seu email");
        doAuth(res);
        const jsonToken = jwtDecoded(getToken);
        if (jsonToken.user.flow === CreateFlow.CREATE_STUDENT)
          navigate(
            `/${PARTNER_PREP}${PARTNER_PREP_INSCRIPTION}/${jsonToken.user.hashPrepCourse}`,
            { relative: "route" }
          );
        else navigate(DASH);
      },
      onError: (error) => {
        if (error.message === "Email já validado") navigate(LOGIN_PATH);
      },
    });
  };

  useEffect(() => {
    handleConfirmEmail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  return <></>;
}
