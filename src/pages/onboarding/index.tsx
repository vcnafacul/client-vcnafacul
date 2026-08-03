import queryString from "query-string";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Text from "../../components/atoms/text";
import OnboardingForm from "../../components/organisms/onboardingForm";

function Onboarding() {
  const location = useLocation();

  // OnboardingRoute já hidrata a store com o token da URL antes de renderizar.
  // Só precisamos limpar o token da URL para não ficar no histórico do browser.
  useEffect(() => {
    const token = (queryString.parse(location.search).token as string) || "";
    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
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
