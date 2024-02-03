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
                console.log(subCardInfo)
                // if(subCardInfo.permission != undefined ? !permissao[subCardInfo.permission] : false) return null
                if(subCardInfo.permissions?.some(p => permissao[p])) 
                    return <SubDashCard blank={subCardInfo.permissions?.length > 1} key={subCardInfo.text} subCardInfo={subCardInfo} />
                return null
            })}
        </div>
    )
}

export default SubMenuDash