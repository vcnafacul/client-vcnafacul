import { Route } from "react-router-dom";
import Geo from "../pages/Geo";
import GeoSearch from "../pages/geoSearch";
import { GEOLOCATION_REGISTER, GEOLOCATION_SEARCH } from "./path";

/**
 * Rotas públicas do Localiza Cursinho (tickets/022). A URL era `/geolocation`;
 * o card 10 a trocou por `/localiza-cursinho`, sem redirecionar a antiga.
 *
 * Função (e não componente) porque o `<Routes>` só aceita `<Route>` como filho
 * direto. `/localiza-cursinho` = busca (card 04); `/cadastro` = o formulário.
 */
export function rotasDoLocalizaCursinho() {
  return [
    <Route key="lc-busca" path={GEOLOCATION_SEARCH} element={<GeoSearch />} />,
    <Route key="lc-cadastro" path={GEOLOCATION_REGISTER} element={<Geo />} />,
  ];
}
