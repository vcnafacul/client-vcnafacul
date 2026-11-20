import { NavLink } from "react-router-dom";
import { CirclePlus } from "lucide-react";
import { Roles } from "../../../enums/roles/roles";
import { useSidebar } from "@/components/ui/sidebar";

export interface SubDashCardInfo {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    alt: string;
    text: string;
    link: string;
    permissions?: Roles[];
}

interface SubDashCardPros{
    subCardInfo: SubDashCardInfo,
    blank?: boolean,
}

function SubDashCard({ subCardInfo, blank }: SubDashCardPros){
    const Icon = subCardInfo.icon;
    const { isMobile, setOpenMobile } = useSidebar();

    const handleClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        // Página atual: fundo levíssimo, filete marine à esquerda e texto em
        // marine — destaca sem brigar com as cores dos cards. O `NavLink` já
        // põe `aria-current="page"` e vale também para as subpáginas (ex.:
        // detalhe de uma turma acende "Turmas").
        <NavLink
            to={subCardInfo.link}
            target={blank ? "_blank" : ''}
            onClick={handleClick}
            className={({ isActive }) =>
                `flex justify-between items-center w-full h-14 px-4 border transition-colors ${
                    isActive && !blank
                        ? "bg-primary/5 text-foreground font-semibold border-l-4 border-l-primary"
                        : ""
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div className="flex gap-2 justify-center items-center">
                        <Icon className={`w-6 h-6 ${isActive && !blank ? "fill-primary" : "fill-muted-foreground"}`}/>
                        {subCardInfo.text}
                    </div>
                    <CirclePlus className="h-4 w-4" color="green" />
                </>
            )}
        </NavLink>
    )
}

export default SubDashCard