import { StatusEnum } from "@/enums/generic/statusEnum";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";

export interface StudentInscriptionDTO {
  userId: string;
  firstName: string;
  lastName: string;
  socialName?: string | undefined;
  whatsapp: string;
  birthday: Date;
  email: string;
  rg: string;
  uf: string;
  cpf: string;
  urgencyPhone: string;
  street: string;
  number: number;
  postalCode: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  inscriptionId: string;
  legalGuardian?: LegalGuardianDTO;
  socioeconomic: SocioeconomicAnswer[];
}

export interface LegalGuardianDTO {
  fullName?: string | undefined;
  family_relationship?: string | undefined;
  rg?: string | undefined;
  uf?: string | undefined;
  cpf?: string | undefined;
  phone?: string | undefined;
}

export interface DataInscription {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: StatusEnum;
}
