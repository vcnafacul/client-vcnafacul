import { ClassStudent } from "./classStudent";

export interface ClassEntity {
  id: string;
  name: string;
  description?: string;
  year: number;
  startDate: Date;
  endDate: Date;
  number_students: number;
}

export interface ClassEntityWithStudents extends ClassEntity {
  students: ClassStudent[];
}