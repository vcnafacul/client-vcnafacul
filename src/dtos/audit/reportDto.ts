import { ReportEntity } from "../../enums/audit/reportEntity";

export interface ReportDTO {
    entity: ReportEntity;
    entityId: string;
    message: string;
  }