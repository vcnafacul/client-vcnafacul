export interface VerifyDeclaredInscriptionDto {
  studentId: string;
  isFree: boolean;
  declared: boolean;
  expired: boolean;
  convocated: boolean;
  requestDocuments: boolean;
  documentsDone: boolean;
  photoDone: boolean;
  surveyDone: boolean;
}