import { Link } from "react-router-dom";

import { ReactComponent as LogoIcon } from "../../../assets/images/home/logo.svg";

interface LogoProps {
    solid?: boolean;
    text?: boolean;
}

function Logo({ solid, text }: LogoProps){
    return (
        <Link to="#">
            <div className="flex items-center">
                <LogoIcon />
                { text ? <div className={`ml-2.5 text-lg md:text-xl ${solid ? 'text-marine' : 'text-white'}`}>
                    você na <strong>facul</strong>
                </div> : <></>}
            </div>
        </Link>
    )
}

export default Logo;