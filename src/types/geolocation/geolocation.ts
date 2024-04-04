import { CardDash } from "../../components/molecules/cardDash";

export interface CreateGeolocation {
    latitude: number;
    longitude: number;
    name: string;
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    complement: string;
    phone: string;
    whatsapp: string;
    email: string;
    email2: string;
    category: string;
    site: string;
    linkedin: string;
    youtube: string;
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    userFullName: string;
    userPhone: string;
    userConnection: string;
    userEmail: string;
}

export interface Geolocation extends CreateGeolocation, CardDash {
    createdAt: string;
    updatedAt: string;
}