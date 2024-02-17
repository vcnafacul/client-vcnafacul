/* eslint-disable @typescript-eslint/no-explicit-any */
import { Volunteer } from "../../components/organisms/supporters";
import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function getVolunteers (): Promise<Volunteer[]> {
    const response = await fetchWrapper(`${userRoute}/volunteers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const res : any[] = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Voluntários`)
    }
    const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;
    const volunteers : Volunteer[] = res.map(volunteer => ({
        name: volunteer.firstName  + ' ' + volunteer.lastName,
        image: `${VITE_FTP_PROFILE}/${volunteer.collaboratorPhoto}`,
        description: volunteer.collaboratorDescription,
        alt: `foto colaborador ${volunteer.lastName}`
    }))
    return volunteers
}
