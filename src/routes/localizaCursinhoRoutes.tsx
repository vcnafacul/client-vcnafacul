import { Route } from "react-router-dom";
import Geo from "../pages/Geo";
import { GEOLOCATION_REGISTER, GEOLOCATION_SEARCH } from "./path";

/**
 * Rotas públicas do Localiza Cursinho (tickets/022). A URL era `/geolocation`;
 * o card 10 a trocou por `/localiza-cursinho`, sem redirecionar a antiga.
 *
 * Função (e não componente) porque o `<Routes>` só aceita `<Route>` como filho
 * direto. A busca (tela nova) chega no card 04; até lá, as duas abrem o cadastro.
 */
export function rotasDoLocalizaCursinho() {
  return [
    <Route key="lc-busca" path={GEOLOCATION_SEARCH} element={<Geo />} />,
    <Route key="lc-cadastro" path={GEOLOCATION_REGISTER} element={<Geo />} />,
  ];
}
