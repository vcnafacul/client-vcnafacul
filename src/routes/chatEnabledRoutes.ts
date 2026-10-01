import {
  DECLARED_INTEREST,
  PARTNER_PREP,
  PARTNER_PREP_INSCRIPTION,
} from "./path";

export interface ChatEnabledRoute {
  pattern: string;
  paramKey: 'inscriptionCourseId' | 'declaredInterestInscriptionCourseId';
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
    // O :inscriptionId desta rota é um id de InscriptionCourse.
    paramKey: 'declaredInterestInscriptionCourseId',
    routeParam: 'inscriptionId',
  },
];
