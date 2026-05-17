import {
  DECLARED_INTEREST,
  PARTNER_PREP,
  PARTNER_PREP_INSCRIPTION,
} from "./path";

export interface ChatEnabledRoute {
  pattern: string;
  paramKey: 'inscriptionCourseId' | 'studentCourseId';
  routeParam: string;
}

export const CHAT_ENABLED_ROUTES: ChatEnabledRoute[] = [
  {
    pattern: `/${PARTNER_PREP}${PARTNER_PREP_INSCRIPTION}/:hashInscriptionId`,
    paramKey: 'inscriptionCourseId',
    routeParam: 'hashInscriptionId',
  },
  {
    pattern: `/${DECLARED_INTEREST}/:inscriptionId`,
    paramKey: 'studentCourseId',
    routeParam: 'inscriptionId',
  },
];
