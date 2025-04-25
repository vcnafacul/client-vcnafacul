import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import AllContent from "./allContent";
import OnlyDemand from "./onlyDemand";

function DashContent() {
  const {
    data: { permissao },
  } = useAuthStore();

  if (permissao[Roles.validarDemanda]) {
    return <AllContent />;
  }
  return <OnlyDemand />;
}

export default DashContent;
