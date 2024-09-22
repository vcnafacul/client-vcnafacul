import { AuthUpdate } from "@/store/auth";

export type UserMe = AuthUpdate & {
  id: string;
  socialName?: string;
  email: string;
  street?: string;
  number?: number;
  complement?: string;
  neighborhood?: string;
  postalCode?: string;
};
