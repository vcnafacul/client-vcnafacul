import { GeolocationUpdateDto } from "../../dtos/geolocation/geolocationUpdateDto";
import { Geolocation } from "../../types/geolocation/geolocation";
import { geolocations } from "../urls";

interface UpdateGeolocationProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any;
    token: string
}

export async function UpdateGeolocation({ body, token}: UpdateGeolocationProps){
    const respose = await fetch(geolocations, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(converteGeolocationUpdateDto(body)),
    });
    return await respose.json()
}

export async function UpdateGeolocationStatus({ body, token}: UpdateGeolocationProps){
    try {
        const respose = await fetch(`${geolocations}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        return await respose.json()
    } catch (error) {
        console.error(error)
        return null;
    }
}

const converteGeolocationUpdateDto = (geo: Geolocation): GeolocationUpdateDto => {
    const noneFields = new Set(['createdAt', 'updatedAt', 'deletedAt', 'userFullName', 'userPhone', 'userConnection', 'userEmail', 'status']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    
    Object.keys(geo).forEach((key) => {
        if (!noneFields.has(key) && geo[key as keyof Geolocation] !== undefined) {
            result[key as keyof Geolocation] = geo[key as keyof Geolocation];
        }
    });
    
    return result as GeolocationUpdateDto;
}