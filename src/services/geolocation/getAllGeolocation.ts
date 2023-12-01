import { Geolocation } from "../../types/geolocation/geolocation";
import { StatusEnum } from "../../types/geolocation/statusEnum";
import { allGeolocation } from "../urls"

export async function getAllGeolocation(status: StatusEnum): Promise<Geolocation[]> {
    const url = `${allGeolocation}?offset=0&limit=40&status=${status}`;
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
    });
    return await res.json() as Geolocation[]  
}