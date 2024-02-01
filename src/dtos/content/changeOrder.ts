import { Insert } from "../../enums/content/insert";

export interface ChangeOrderDTO {
    listId: number;
    node1: number;
    node2?: number;
    where: Insert;
  }
  