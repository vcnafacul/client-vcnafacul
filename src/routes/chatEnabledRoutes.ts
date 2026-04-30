import {
  DECLARED_INTEREST,
  PARTNER_PREP,
  PARTNER_PREP_INSCRIPTION,
} from "./path";

export const CHAT_ENABLED_ROUTES: string[] = [
  `/${PARTNER_PREP}${PARTNER_PREP_INSCRIPTION}/:hashInscriptionId`,
  `/${DECLARED_INTEREST}/:inscriptionId`,
];
