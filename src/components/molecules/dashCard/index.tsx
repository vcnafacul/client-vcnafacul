import { ComponentProps, useMemo } from "react";
import { CircleChevronUp } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import SubMenuDash from "../../organisms/subMenuDash";
import { SubDashCardInfo } from "../subDashCard";
import { useAuthStore } from "../../../store/auth";

const transition = "transition-all duration-300";

// Card inteiro na cor de identidade de antes do design system (`bg`, um `bg-identity-<card>`), com
// texto `identity-foreground`. Exceção à R26 decidida em 2026-11-23: várias dessas cores não chegam
// a 4,5:1 com o branco, e o contrast.test registra as razões medidas.
const dashCard = cva(
  `text-identity-foreground font-bold text-body py-3 px-2 flex items-center relative ${transition}`,
  {
  variants: {
    size: {
      big: "flex-col justify-between h-32",
      small: "flex-row justify-between gap-4 h-16 px-4",
    },
  },
  defaultVariants: {
    size: "big",
  },
  }
);

export interface DashCardMenu {
  id: number;
  /** Classe `bg-identity-<card>` do card. */
  bg: string;
  title: string;
  image: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  alt: string;
  subMenuList: SubDashCardInfo[];
}
//criar logica para fechado e aberto no tv
type DasCardProps = VariantProps<typeof dashCard> &
  ComponentProps<"div"> & {
    card: DashCardMenu;
    opened: boolean;
  };

function DashCard({ card, size, opened, ...props }: DasCardProps) {
  const {
    data: { permissao },
  } = useAuthStore();
  const Icon = card.image;

  // Calculado no render (não em efeito): o card já nasce visível, sem um
  // primeiro render escondido.
  const appearsAdminDashcard = useMemo(
    () =>
      card.subMenuList.some(
        (subCardInfo) =>
          !subCardInfo.permissions ||
          subCardInfo.permissions.some((p) => permissao[p]),
      ),
    [card.subMenuList, permissao],
  );

  return (
    appearsAdminDashcard && (
      <div>
        <div
          {...props}
          className={`${cn(dashCard({ size }))} ${card.bg} ${size !== "small" && !opened ? "mt-4 rounded-md" : "mt-0"} cursor-pointer`}
        >
          <Icon
            aria-hidden="true"
            className={`select-none fill-identity-foreground text-identity-foreground ${size !== "small" ? "w-16 h-16" : "w-7 h-7"} ${transition}`}
          />
          <div
            className={`select-none ${size !== "small" ? "flex justify-center w-full" : "my-4"}`}
          >
            {card.title}
          </div>
          <CircleChevronUp
            aria-hidden="true"
            className={`h-5 w-5 ${size !== "small" ? "absolute right-4 bottom-4" : ""} ${opened ? "rotate-180" : ""} ${transition}`}
          />
        </div>
        {/*
          ⚠️ Abre/fecha por `grid-template-rows` (0fr ↔ 1fr), sem medir altura.
          Antes era `max-height` com o `scrollHeight` medido num efeito: na
          gaveta do mobile o card desmonta ao fechar o menu e, ao reabrir com a
          seção ainda aberta, a medição rodava antes do card existir e ficava
          em 0 — seção "aberta" sem nenhum subitem, pedindo dois cliques.
        */}
        <div
          data-testid="submenu"
          className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
          style={{
            gridTemplateRows: opened ? "1fr" : "0fr",
            opacity: opened ? 1 : 0,
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <SubMenuDash subDashCardInfo={card.subMenuList} />
          </div>
        </div>
      </div>
    )
  );
}

export default DashCard;
