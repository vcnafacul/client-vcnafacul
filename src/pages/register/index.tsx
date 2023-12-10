import BaseTemplate from "../../components/templates/baseTemplate"
import { footer, header } from "../home/data"

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import RegisterForm from "../../components/organisms/registerForm";
import { registerForm } from "./data";



function Register(){
    return (
        <BaseTemplate header={header} footer={footer} solid={true} className="bg-white overflow-y-auto scrollbar-hide h-screen">
            <div className="relative">
                <TriangleGreen className="graphism triangle-green"/>
                <TriangleYellow className="graphism triangle-yellow"/>
                {/* register form */}
                <RegisterForm {...registerForm} />
            </div>
        </BaseTemplate>
    )
}

export default Register