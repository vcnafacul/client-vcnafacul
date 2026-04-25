// client-vcnafacul/src/pages/homeV2/adapters/actionAreasAdapter.ts
import { actionAreas } from "../../../pages/home/data";
import type React from "react";

export interface SubjectItem {
  id: number;
  title: string;
  Image: React.FC<React.SVGProps<SVGSVGElement>>;
}
export interface AreaGroup {
  id: number;
  title: string;
  themeColor: string;
  textColor: string;
  subjects: SubjectItem[];
}

const COLORS = [
  { themeColor: "#da005a", textColor: "#ffffff" }, // Linguagens
  { themeColor: "#37d6b5", textColor: "#0b2747" }, // Natureza+Mat
  { themeColor: "#f7b733", textColor: "#0b2747" }, // Humanas
];

export const actionAreasData: AreaGroup[] = actionAreas.areas.map((a, i) => ({
  id: a.Home_Action_Area_id.id,
  title: a.Home_Action_Area_id.title,
  themeColor: COLORS[i % COLORS.length].themeColor,
  textColor: COLORS[i % COLORS.length].textColor,
  subjects: a.Home_Action_Area_id.items.map((it) => ({
    id: it.Home_Action_Area_Item_id.id,
    title: it.Home_Action_Area_Item_id.title,
    Image: it.Home_Action_Area_Item_id.image as React.FC<React.SVGProps<SVGSVGElement>>,
  })),
}));
