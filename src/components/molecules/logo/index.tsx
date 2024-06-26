import { Link } from "react-router-dom";

import { ReactComponent as LogoIcon } from "../../../assets/images/home/logo.svg";
import { HOME_PATH } from "../../../routes/path";

interface LogoProps {
    solid?: boolean;
    name?: boolean;
    text?: string;
}

function Logo({ solid, name, text }: LogoProps){
    return (
        <div className="flex flex-col">
            <Link to={HOME_PATH}>
                <div className="flex items-center justify-center md:justify-start">
                    <LogoIcon />
                    { name ? <div className={`ml-2.5 text-lg md:text-xl ${solid ? 'text-marine' : 'text-white'}`}>
                        você na <strong>facul</strong>
                    </div> : <></>}
                </div>
            </Link>   
            {text ? <p className="italic mx-0 mt-4 mb-4 md:mb-0 text-white">{text}</p> : <></>}
        </div>
    )
}

export default Logo;