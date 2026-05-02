import queryString from "query-string";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Text from "../../components/atoms/text";
import OnboardingForm from "../../components/organisms/onboardingForm";
import { useAuthStore } from "../../store/auth";
import { decoderUser } from "../../utils/decodedUser";

function Onboarding() {
  const location = useLocation();
  const { doAuth } = useAuthStore();

  useEffect(() => {
    const token = (queryString.parse(location.search).token as string) || "";
    if (token) {
      try {
        const authData = decoderUser(token);
        doAuth(authData);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch {
        // token inválido, OnboardingGate vai redirecionar
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-88px)] mb-3 px-4 mx-auto py-10">
      <div className="mt-10 max-w-[500px] flex flex-col items-center w-full gap-y-4">
        <Text size="secondary">Complete seu cadastro</Text>
        <OnboardingForm />
      </div>
    </div>
  );
}

export default Onboarding;
