import { SectionForm } from "./sectionForm";

interface PartnerPrepForm {
  _id: string;
  name: string;
  inscriptionId: string;
  sections: SectionForm[];
  createdAt: Date;
  updatedAt: Date;
}

export default PartnerPrepForm;
