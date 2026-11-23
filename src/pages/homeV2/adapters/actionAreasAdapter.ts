// client-vcnafacul/src/pages/homeV2/adapters/actionAreasAdapter.ts
import { actionAreas } from "../../../pages/homeLegacy/data";
import type React from "react";
import { palette } from "@/lib/palette";

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
  { themeColor: palette.pink[600], textColor: palette.marine[50] }, // Linguagens
  { themeColor: palette.mint[400], textColor: palette.marine[900] }, // Natureza+Mat
  { themeColor: palette.yellow[400], textColor: palette.marine[900] }, // Humanas
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
