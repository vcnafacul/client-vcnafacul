import BaseTemplate from "@/components/templates/baseTemplate";
import { verifyDeclaredInterest } from "@/services/prepCourse/student/verifyDeclaredInterest";
import { jwtDecoded } from "@/utils/jwt";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ConfirmEnrolledExpiredMessage from "./confirmEnrolledMessage";
import DeclareInterest from "./declareInterest";

export function ConfirmEnrolledPage() {
  const location = useLocation();
  const getToken = (queryString.parse(location.search).token as string) || "";
  const [declaredInterest, setDeclaredInterest] = useState(false);
  const [error, setError] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let decoded: any = null;
  let expired = true;
  if (getToken) {
    decoded = jwtDecoded(getToken);
    expired = decoded.exp * 1000 < Date.now();
  }
  const studentId = decoded.user.id as string;

  useEffect(() => {
    if (getToken) {
      verifyDeclaredInterest(studentId, getToken)
        .then((res) => {
          setDeclaredInterest(res);
        })
        .catch((e) => {
          setError(e.message);
        });
    }
  }, []);

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
      ) : declaredInterest ? (
        <ConfirmEnrolledExpiredMessage>
          Você ja declarou interesse nesta vaga.
        </ConfirmEnrolledExpiredMessage>
      ) : error ? (
        <ConfirmEnrolledExpiredMessage>
          {error}
        </ConfirmEnrolledExpiredMessage>
      ) : (
        <div className="flex flex-col items-center min-h-[calc(100vh-76px)] w-full">
          <DeclareInterest
            isFree={true}
            queryToken={getToken}
            studentId={studentId}
          />
        </div>
      )}
    </BaseTemplate>
  );
}
