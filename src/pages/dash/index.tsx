import BaseTemplate from "../../components/templates/baseTemplate"
import { footer } from "../Home/data"
import { headerDash } from "./data"

function Dash(){
    return (
        <BaseTemplate header={headerDash} footer={footer} solid >
            <div>
                Dash
            </div>
        </BaseTemplate>
    )
}

export default Dash