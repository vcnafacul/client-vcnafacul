import { format } from "date-fns";

export const formatDate = (dateString?: string) => dateString && format(new Date(dateString), "dd/MM/yyyy");