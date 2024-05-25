import { ComponentProps, useEffect, useState } from "react";
import { IoChevronUpCircleSharp } from "react-icons/io5";
import { VariantProps, tv } from "tailwind-variants";
import SubMenuDash from "../../organisms/subMenuDash";
import { SubDashCardInfo } from "../subDashCard";
import { useAuthStore } from "../../../store/auth";

const transition = 'transition-all duration-300'

const dashCard = tv({
    base: `text-white font-bold text-base py-3 px-2 flex items-center relative ${transition}`,
    variants: {
        size: {
            big: 'flex-col justify-between h-32',
            small: 'flex-row justify-between gap-4 h-16 px-4'
        },
        
    },
    defaultVariants: {
        size: 'big',
    }
  },
)

export interface DashCardMenu {
  id: number;
  bg: string;
  title: string;
  image: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  alt: string;
  subMenuList: SubDashCardInfo[]
}
//criar logica para fechado e aberto no tv
type DasCardProps = VariantProps<typeof dashCard> & ComponentProps<'div'> & {
  card: DashCardMenu
  opened: boolean;
}

function DashCard({ card, size, opened, ...props }: DasCardProps) {
  const [appearsAdminDashcard, setAppearsAdminDashcard] = useState(false)
  const { data: { permissao }} = useAuthStore()
  const Icon = card.image;
  useEffect(() => {
    const newSubMenus = !!card.subMenuList.find(subCardInfo => {
      if(!subCardInfo.permissions || subCardInfo.permissions?.some(p => permissao[p]))
        return true;
      return false
    });
    setAppearsAdminDashcard(newSubMenus)
  }, [card.subMenuList, permissao]);
  
  return (
    appearsAdminDashcard && (
      <>
      <div {...props}
        className={`${dashCard({ size })} ${card.bg} ${size !== 'small' && !opened ? 'mt-4 rounded-t-md' : 'mt-0'} cursor-pointer`}>
        <Icon className={`select-none fill-white ${size !== 'small' ? 'w-16 h-16' : 'w-7 h-7'} ${transition}`} />
        <div className={`select-none ${size !== 'small' ? 'flex justify-center w-full' : 'my-4'}`}>{card.title}</div>
        <IoChevronUpCircleSharp size={20} className={`${size !== 'small' ? 'absolute right-4 bottom-4' : ''} ${opened ? 'rotate-180' : ''} ${transition}`} />
      </div>
      {opened ? <SubMenuDash subDashCardInfo={card.subMenuList} /> : <></>}
    </>
    )
  )
}

export default DashCard
