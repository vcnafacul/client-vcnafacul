import { Auth } from "@/store/auth";

export type UserMe = Auth & {
  socialName?: string;
  email: string;
  street?: string;
  number?: number;
  complement?: string;
  neighborhood?: string;
  postalCode?: string;
};
