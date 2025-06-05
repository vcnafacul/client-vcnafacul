import { format } from "date-fns";

export const formatDate = (dateString?: string, formatString: string = "dd/MM/yyyy") =>
  dateString ? format(new Date(dateString), formatString) : "";
