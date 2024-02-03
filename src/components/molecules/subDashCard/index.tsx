import { Link } from "react-router-dom";
import { IoAddCircle } from "react-icons/io5";
import { Roles } from "../../../enums/roles/roles";

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
    return (
        <Link to={subCardInfo.link} target={blank ? "_blank" : ''} className="flex justify-between items-center gap-4 w-full h-14 px-4 border">
            <div className="flex gap-4 justify-center items-center">
                <Icon className="w-6 h-6 fill-grey"/>
                {subCardInfo.text}
            </div>
            <IoAddCircle size={14} color="green" />
        </Link>
    )
}

export default SubDashCard