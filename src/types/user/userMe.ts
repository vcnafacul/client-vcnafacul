import { Auth } from "@/store/auth";

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
};
