import { ClassStudent } from "./classStudent";

export interface ClassEntity {
  id: string;
  name: string;
  description?: string;
  number_students: number;
}

export interface ClassEntityWithStudents extends ClassEntity {
  students: ClassStudent[];
}
