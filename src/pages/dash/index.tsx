import DashTemplate from "../../components/templates/dashTemplate"
import { dashCardList, headerDash } from "./data"

function Dash(){
    return (
        <DashTemplate header={headerDash} dashCardList={dashCardList}>
            <div className="w-96 h-96 bg-blue-400">
                Dash 2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                Dash 2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                Dash 2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                Dash 2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                Dash 2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
            </div>
        </DashTemplate>
    )
}

export default Dash