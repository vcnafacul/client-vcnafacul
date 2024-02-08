import BaseTemplate from "../../components/templates/baseTemplate"
import { footer, header } from "../home/data"
import '../../styles/graphism.css'

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import { ForgotForm } from "../../components/organisms/forgotForm";
import { forgotForm } from "./data";

function Forgot(){

    return (
        <BaseTemplate header={header} footer={footer} solid={true} className="bg-white overflow-y-auto scrollbar-hide h-screen">
            <div className="relative">
                <TriangleGreen className="graphism triangle-green"/>
                <TriangleYellow className="graphism triangle-yellow"/>
                <ForgotForm { ...forgotForm }/>
            </div>
        </BaseTemplate>
    )
}

export default Forgot