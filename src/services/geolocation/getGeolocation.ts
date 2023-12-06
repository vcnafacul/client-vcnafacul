import { geolocations } from "../urls";
import { Geolocation } from "../../types/geolocation/geolocation"
import fetchWrapper from "../../utils/fetchWrapper";

const getGeolocation = async () : Promise<Geolocation[]> => {
    try {
        const response = await fetchWrapper(geolocations, {
            headers: { "Content-Type": "application/json" },
        });

        if(response.status !== 200) {
            return [] as Geolocation[]
        }
        return await response.json()
        
    } catch (error) {
        console.error("Error:", error);
        return [] as Geolocation[]
      }
}

export default getGeolocation 