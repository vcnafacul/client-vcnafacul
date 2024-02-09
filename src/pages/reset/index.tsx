import BaseTemplate from "../../components/templates/baseTemplate"
import { footer, header } from "../home/data"
import '../../styles/graphism.css'

import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import { ResetForm } from "../../components/organisms/resetForm";
import { resetForm } from "./data";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import Text from "../../components/atoms/text";

export function Reset(){

    const location = useLocation();
    const getToken = queryString.parse(location.search).token as string || "";

    return (
        <BaseTemplate header={header} footer={footer} solid={true} className="bg-white overflow-y-auto scrollbar-hide h-screen">
            <div className="relative">
                <TriangleGreen className="graphism triangle-green"/>
                <TriangleYellow className="graphism triangle-yellow"/>
                {getToken ? <ResetForm {...resetForm} token={getToken} /> : 
                <div className=" h-[calc(100vh-88px)] flex justify-center items-center">
                    <Text size="secondary">Ocorreu um erro ao tentar redefinir a senha.</Text></div>}
            </div>
        </BaseTemplate>
    )
}