import { Link } from "react-router-dom";
import { IoAddCircle } from "react-icons/io5";
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
        <Link to={subCardInfo.link} target={blank ? "_blank" : ''} className="flex justify-between items-center w-full h-14 px-4 border" onClick={handleClick}>
            <div className="flex gap-2 justify-center items-center">
                <Icon className="w-6 h-6 fill-grey"/>
                {subCardInfo.text}
            </div>
            <IoAddCircle size={16} color="green" />
        </Link>
    )
}

export default SubDashCard