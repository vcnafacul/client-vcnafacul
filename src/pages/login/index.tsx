import BaseTemplate from "../../components/templates/baseTemplate"
import '../../styles/graphism.css'

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import LoginForm from "../../components/organisms/loginForm";
import { loginForm } from "./data";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { DASH } from "../../routes/path";
import { useEffect } from "react";

function Login(){

    const { data: { token }} = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if(token) {
            navigate(DASH)
        }
    },[navigate, token])


    return (
        <BaseTemplate solid={true} className="bg-white overflow-y-auto scrollbar-hide h-screen">
            <div className="relative">
                <TriangleGreen className="graphism triangle-green"/>
                <TriangleYellow className="graphism triangle-yellow"/>
                <LoginForm {...loginForm} />
            </div>
        </BaseTemplate>
    )
}

export default Login