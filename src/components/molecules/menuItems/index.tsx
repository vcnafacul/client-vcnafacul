import { VariantProps, tv } from "tailwind-variants";
import { Link } from "react-router-dom";

const menuItem = tv({
    base: 'flex justify-center items-center',
    variants: {
        align: {
            horizontal: 'flex-row md:mx-6',
            vertical: 'flex-col mb-2'
        },
        solid: {
            true: 'text-marine',
            false: 'text-white'
        }
    },
    defaultVariants: {
        align: 'horizontal',
        solid: false
    }
})

interface ItemMenu {
    id: number;
    name: string;
    link: string;
    target: string;
    image?: string;
    image_dark_theme?: string;
}

export interface ItemMenuProps {
    Home_Menu_Item_id: ItemMenu
}

type MenuItemProps = VariantProps<typeof menuItem> & {
    className?: string;
    itemsMenu: ItemMenuProps[],
    solid: boolean;
}

function MenuItem({ align, itemsMenu, className, solid } : MenuItemProps) {
    return (
        <div className={menuItem({ align, solid, className })}>
            {itemsMenu?.map(link => {
                if(link.Home_Menu_Item_id.link.includes('#') ) {
                    return (
                    <a className="text-xl font-bold md:text-base md:font-medium mx-6 my-3" target={link.Home_Menu_Item_id.target}
                        key={link.Home_Menu_Item_id.id} href={link.Home_Menu_Item_id.link}>{link.Home_Menu_Item_id.name}
                    </a> 
                    )
                } 
                return (
                    <Link className="text-xl font-bold md:text-base md:font-medium mx-6 my-3" target={link.Home_Menu_Item_id.target}
                        key={link.Home_Menu_Item_id.id} to={link.Home_Menu_Item_id.link}>{link.Home_Menu_Item_id.name}
                    </Link>
                )
            })}
        </div>
    )
}

export default MenuItem