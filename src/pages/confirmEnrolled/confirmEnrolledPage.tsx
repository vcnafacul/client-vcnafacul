import { JSX, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";

import BaseTemplate from "@/components/templates/baseTemplate";
import ConfirmEnrolledExpiredMessage from "./confirmEnrolledMessage";
import DeclareInterest from "./declareInterest";

import { VerifyDeclaredInscriptionDto } from "@/dtos/inscription/verifyDeclaredInscriptionDto";
import { verifyDeclaredInterest } from "@/services/prepCourse/student/verifyDeclaredInterest";
import { useAuthStore } from "@/store/auth";

export function ConfirmEnrolledPage() {
  const [declaredInterest, setDeclaredInterest] =
    useState<VerifyDeclaredInscriptionDto | null>(null);
  const [error, setError] = useState<string>("");

  const {
    data: { token },
  } = useAuthStore();
  const { inscriptionId } = useParams();

  useEffect(() => {
    verifyDeclaredInterest(inscriptionId || "", token)
      .then(setDeclaredInterest)
      .catch((e) => setError(e.message));
  }, []);

  let componentToRender: JSX.Element;

  if (error) {
    componentToRender = (
      <ConfirmEnrolledExpiredMessage>{error}</ConfirmEnrolledExpiredMessage>
    );
  } else if (!declaredInterest) {
    componentToRender = (
      <div className="w-full h-full flex justify-center pt-40">
        <MoonLoader color="#FF7600" size={50} speedMultiplier={0.2} />
      </div>
    );
  } else {
    const {
      expired,
      convocated,
      declared,
      isFree,
      studentId,
      requestDocuments,
    } = declaredInterest;

    if (declared) {
      componentToRender = (
        <ConfirmEnrolledExpiredMessage>
          Você já declarou interesse nesta vaga. Caso tenha dúvidas sobre os
          próximos passos, entre em contato com o cursinho responsável.
        </ConfirmEnrolledExpiredMessage>
      );
    } else if (expired) {
      componentToRender = (
        <ConfirmEnrolledExpiredMessage>
          O prazo para declarar interesse nesta vaga foi encerrado. Para mais
          informações, entre em contato com o cursinho ou com nossa equipe de
          suporte.
        </ConfirmEnrolledExpiredMessage>
      );
    } else if (!convocated) {
      componentToRender = (
        <ConfirmEnrolledExpiredMessage>
          Você não foi convocado para esta vaga. Recomendamos acompanhar futuras
          oportunidades ou esclarecer dúvidas diretamente com o cursinho.
        </ConfirmEnrolledExpiredMessage>
      );
    } else {
      // convocated = true && declared = false && !expired
      componentToRender = (
        <div className="flex flex-col items-center min-h-[calc(100vh-76px)] w-full">
          <DeclareInterest
            isFree={isFree}
            studentId={studentId}
            requestDocuments={requestDocuments}
          />
        </div>
      );
    }
  }

  return (
    <BaseTemplate
      solid
      className="bg-white overflow-y-auto scrollbar-hide h-screen"
    >
      {componentToRender}
    </BaseTemplate>
  );
}
