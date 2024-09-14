import { Insert } from "../../enums/content/insert";

export interface ChangeOrderDTO {
    listId: string;
    node1: string;
    node2?: string;
    where: Insert;
  }
  