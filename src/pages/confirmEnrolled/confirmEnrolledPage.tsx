import Text from "@/components/atoms/text";
import BaseTemplate from "@/components/templates/baseTemplate";
import { declaredInterest } from "@/services/prepCourse/student/declaredInterest";
import { useAuthStore } from "@/store/auth";
import { jwtDecoded } from "@/utils/jwt";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { BiSolidErrorAlt } from "react-icons/bi";
import { FaCheckDouble } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import ConfirmEnrolledExpiredMessage from "./confirmEnrolledMessage";

export function ConfirmEnrolledPage() {
  const location = useLocation();
  const getToken = (queryString.parse(location.search).token as string) || "";
  const [processing, setProcessing] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let decoded: any = null;
  let expired = true;
  if (getToken) {
    decoded = jwtDecoded(getToken);
    expired = decoded.exp * 1000 < Date.now();
  }

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    if (!expired) {
      declaredInterest(decoded.user.id as string, token)
        .then(() => {
          setProcessing(false);
        })
        .catch((e) => {
          setError(e.message);
          setProcessing(false);
        });
    }
  }, []);

  console.log("teste", expired);

  return (
    <BaseTemplate
      solid
      className="bg-white overflow-y-auto scrollbar-hide h-screen"
    >
      {expired ? (
        <ConfirmEnrolledExpiredMessage>
          Lamentamos informar que prazo para declaração de interesse na vaga foi
          encerrado. Caso tenha dúvidas ou deseje mais informações, entre em
          contato com nossa equipe de suporte.
        </ConfirmEnrolledExpiredMessage>
      ) : processing ? (
        <ConfirmEnrolledExpiredMessage>
          <div className="flex flex-col justify-center items-center">
            <Text className="w-96" size="secondary">
              Aguarde enquando a declaração de interesse é processada
            </Text>
            <MoonLoader color="#FF7600" size={60} speedMultiplier={0.4} />
          </div>
        </ConfirmEnrolledExpiredMessage>
      ) : error ? (
        <ConfirmEnrolledExpiredMessage>
          <div className="flex flex-col justify-center items-center gap-4">
            <BiSolidErrorAlt className="w-20 h-20 fill-redError" />
            {error}
          </div>
        </ConfirmEnrolledExpiredMessage>
      ) : (
        <ConfirmEnrolledExpiredMessage>
          <div className="flex flex-col justify-center items-center gap-4">
            <FaCheckDouble className="w-20 h-20 fill-green" />
            <div>
              <Text size="secondary" className="m-0">
                Parabéns, declaração de interesse aceita.
              </Text>
              <Text size="tertiary">
                Agora é com a gente. Logo mais o cursinho entrará em contato com
                você para mais informações
              </Text>
            </div>
          </div>
        </ConfirmEnrolledExpiredMessage>
      )}
    </BaseTemplate>
  );
}
