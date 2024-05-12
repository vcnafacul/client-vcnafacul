import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../molecules/button";

const hiddenCookieBar = () => {
  const cookieBarStatus = window.localStorage.getItem("lgpd_status");
  const cookieUpdatedAt = window.localStorage.getItem("lgpd_updated_at");
  const today = Date.now();

  if (!cookieBarStatus) return false;

  const diffDates = today - parseInt(cookieUpdatedAt || "0");
  const diffDays = Math.floor(diffDates / (1000 * 60 * 60 * 24));
  if (cookieBarStatus === "rejected" && diffDays >= 5) {
    return false;
  }

  return true;
};

export function CookieBar() {
  const [isInvisible, setIsInvisible] = useState(hiddenCookieBar());

  const setLgpdStatus = (value: string) => {
    const today = Date.now();
    window.localStorage.setItem("lgpd_status", value);
    window.localStorage.setItem("lgpd_updated_at", today.toString());
    setIsInvisible(true);
  };

  return (
    <div className={`mx-4 sm:mx-0 sm:max-w-5xl right-0 bottom-4 z-50 ${isInvisible ? "hidden" : "fixed"}`}>
      <div className="flex flex-col gap-4 py-2 bg-gray-100 rounded shadow-md sm:p-4 sm:mx-10 ">
        <div className="flex">
          <span className="mx-4 italic sm:text-base sm:mx-10 ">
            "Nós utilizamos cookies e outras tecnologias semelhantes para
            melhorar sua experiência em nossos serviços, personalizar nossa
            publicidade e recomendar conteúdo de seu interesse. Ao utilizar
            nossos serviços, você aceita a política de monitoramento de cookies.
            Para mais informações, consulte nossa
            <Link className="w-60" to={"/Pol%C3%ADtica%20de%20Privacidade.pdf"}>
              <span className="pl-1 font-black text-marine">
                Politica de Privacidade
              </span>
            </Link>
            "
          </span>
        </div>
        <div className="flex items-center justify-end gap-4 mx-4">
          <div className="w-32 md:w-60">
            <Button
              onClick={() => {
                setLgpdStatus("rejected");
              }}
            >
              <span className="flex justify-center w-full">Rejeitar</span>
            </Button>
          </div>
          <div className="w-32 md:w-60">
            <Button
              onClick={() => {
                setLgpdStatus("accepted");
              }}
            >
              <span className="flex justify-center w-full">Aceitar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
