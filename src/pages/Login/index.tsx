import BaseTemplate from "../../components/templates/baseTemplate"
import { footer, header } from "../Home/data"

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";

function Login(){
    return (
        <BaseTemplate header={header} footer={footer} solid={true} position="relative" className="bg-white">
            <TriangleGreen className="graphism triangle-green"/>
            <TriangleYellow className="graphism triangle-yellow"/>
        </BaseTemplate>
    )
}

export default Login