import React from 'react'
import { Link } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ItemMenuProps } from '../../molecules/menuItems';

interface DropdwonMenuProps {
    userNavigation: ItemMenuProps[];
    children: React.ReactNode;
    className?: string;
    /** Nome do gatilho quando o conteúdo é só um ícone ou um avatar. */
    triggerLabel?: string;
}

function DropdwonMenu({ userNavigation, children, className, triggerLabel }: DropdwonMenuProps) {
    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label={triggerLabel}
                    className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {userNavigation.map((item, index) => (
                        item.Home_Menu_Item_id.onClick ? (
                            // tickets/029: item de AÇÃO (ex.: "Instalar app"), não link.
                            <DropdownMenuItem
                                key={index}
                                onSelect={item.Home_Menu_Item_id.onClick}
                            >
                                {item.Home_Menu_Item_id.name}
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem key={index} asChild>
                                <Link
                                    to={item.Home_Menu_Item_id.link}
                                    target={item.Home_Menu_Item_id.target}
                                >
                                    {item.Home_Menu_Item_id.name}
                                </Link>
                            </DropdownMenuItem>
                        )
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default DropdwonMenu
