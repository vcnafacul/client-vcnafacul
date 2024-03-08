import { ComponentProps } from "react";
import { IoChevronDownCircleSharp, IoChevronUpCircleSharp } from "react-icons/io5";
import { VariantProps, tv } from "tailwind-variants";
import SubMenuDash from "../../organisms/subMenuDash";
import { SubDashCardInfo } from "../subDashCard";

const dashCard = tv({
  base: 'text-white py-3 px-2 flex items-center relative transition-all duration-200',
  variants: {
    size: {
      big: 'flex-col justify-between h-32',
      small: 'flex-row justify-between h-16 px-4'
    }
  },
  defaultVariants: {
    size: 'big'
  }
})

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
  const Icon = card.image;
  return (
    <>
      <div {...props}
        className={`${dashCard({ size })} ${card.bg} ${size !== 'small' && !opened ? 'mt-4 rounded-t-md' : 'mt-0'} cursor-pointer`}>
        <Icon className={`select-none fill-white ${size !== 'small' ? 'mb-6 w-14 h-14' : 'w-4 h-4'}`} />
        <div className={`select-none ${size !== 'small' ? 'flex justify-center w-full' : 'my-4'}`}>{card.title}</div>
        {opened
          ? <IoChevronDownCircleSharp size={20} className={`${size !== 'small' ? 'absolute right-4 bottom-4' : ''}`} />
          : <IoChevronUpCircleSharp size={20} className={`${size !== 'small' ? 'absolute right-4 bottom-4' : ''}`} />}
      </div>
      {opened ? <SubMenuDash subDashCardInfo={card.subMenuList} /> : <></>}
    </>
  )
}

export default DashCard
