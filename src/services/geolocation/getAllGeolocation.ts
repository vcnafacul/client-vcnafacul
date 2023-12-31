import { Geolocation } from "../../types/geolocation/geolocation";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { allGeolocation } from "../urls"
import fetchWrapper from "../../utils/fetchWrapper";

export async function getAllGeolocation(status: StatusEnum): Promise<Geolocation[]> {
    const url = `${allGeolocation}?offset=0&limit=40&status=${status}`;
    const res = await fetchWrapper(url, {
        headers: { "Content-Type": "application/json" },
    });
    return await res.json() as Geolocation[]  
}