import { useAuthStore } from "../../../store/auth"
import SubDashCard, { SubDashCardInfo } from "../../molecules/subDashCard"


interface DashSubCardPros{
    subDashCardInfo: SubDashCardInfo[]
}

function SubMenuDash({ subDashCardInfo }: DashSubCardPros){

    const { data: { permissao }} = useAuthStore()
    return (
        <div>
            {subDashCardInfo.map(subCardInfo => {
                if(subCardInfo.permission != undefined ? !permissao[subCardInfo.permission] : false) return null
                return <SubDashCard key={subCardInfo.text} subCardInfo={subCardInfo} />
            })}
        </div>
    )
}

export default SubMenuDash