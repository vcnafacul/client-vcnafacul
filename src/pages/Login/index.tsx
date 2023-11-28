import BaseTemplate from "../../components/templates/baseTemplate"
import { footer, header } from "../Home/data"
import './styles.css'

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import LoginForm from "../../components/organisms/loginForm";

function Login(){
    return (
        <div className="overflow-y-auto scrollbar-hide h-screen">
            <BaseTemplate header={header} headerShadow footer={footer} solid={true} position="relative" className="bg-white">
                <div className="relative h-[calc(100vh-76px)]">
                    <TriangleGreen className="graphism triangle-green"/>
                    <TriangleYellow className="graphism triangle-yellow"/>
                    <LoginForm />
                </div>
            </BaseTemplate>
        </div>
    )
}

export default Login