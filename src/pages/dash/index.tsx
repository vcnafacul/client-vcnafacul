import DashTemplate from "../../components/templates/dashTemplate"
import { headerDash } from "./data"

function Dash(){
    return (
        <DashTemplate header={headerDash} hasMenu>
            <div className="w-full flex justify-center">
                <div className="w-96">
                    Dash
                </div>
            </div>
        </DashTemplate>
    )
}

export default Dash