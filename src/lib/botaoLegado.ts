import type { ComponentProps } from "react";

import type { ButtonProps } from "@/components/ui/button";

/**
 * Forma dos botões que as telas ainda descrevem como dado (`buttons` do
 * `DashCardTemplate`, `ModalType`, `FormSubmit`). Era o `ButtonProps` do botão
 * V1; o componente agora é o `Button` do design system, e este arquivo faz a
 * ponte entre o dado antigo e o `variant`/`size` novo (tickets/059 §7.4).
 */
export type TypeStyleLegado =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "accepted"
  | "refused"
  | "none";

export type BotaoLegadoProps = ComponentProps<"button"> & {
  typeStyle?: TypeStyleLegado;
  size?: "base" | "small";
};

type Variant = NonNullable<ButtonProps["variant"]>;

const VARIANT_DO_TYPE_STYLE: Record<TypeStyleLegado, Variant> = {
  primary: "primary",
  secondary: "outline",
  tertiary: "outline",
  quaternary: "outline",
  accepted: "primary",
  refused: "destructive",
  none: "ghost",
};

export function variantDoTypeStyle(typeStyle?: TypeStyleLegado): Variant {
  return VARIANT_DO_TYPE_STYLE[typeStyle ?? "primary"];
}

/** `base` (o padrão do V1) era `w-full h-12`: vira `lg` + `w-full`. */
export function propsDeTamanho(size: BotaoLegadoProps["size"] = "base"): {
  size: "sm" | "lg";
  widthClass: string;
} {
  return size === "small"
    ? { size: "sm", widthClass: "" }
    : { size: "lg", widthClass: "w-full" };
}
