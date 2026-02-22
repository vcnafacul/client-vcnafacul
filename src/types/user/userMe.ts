import { Auth } from "@/store/auth";
import { Afinidade } from "../partnerPrepCourse/afinidades";

export type UserMe = Auth & {
  id: string;
  socialName?: string;
  useSocialName: boolean;
  email: string;
  street?: string;
  number?: number;
  complement?: string;
  neighborhood?: string;
  postalCode?: string;
  collaborator: boolean;
  collaboratorDescription?: string | null;
  collaboratorPhoto?: string | null;
  collaboratorFrentes?: string[]; // IDs das frentes selecionadas
  afinidades?: Afinidade[];
};
