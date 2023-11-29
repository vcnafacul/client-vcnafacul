import BaseTemplate from "../../components/templates/baseTemplate"
import { footer, header } from "../Home/data"
import './styles.css'

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import LoginForm from "../../components/organisms/loginForm";
import { loginForm } from "./data";

function Login(){
    return (
        <BaseTemplate header={header} footer={footer} solid={true} className="bg-white overflow-y-auto scrollbar-hide h-screen">
            <div className="relative">
                <TriangleGreen className="graphism triangle-green"/>
                <TriangleYellow className="graphism triangle-yellow"/>
                <LoginForm {...loginForm} />
            </div>
        </BaseTemplate>
    )
}

export default Login