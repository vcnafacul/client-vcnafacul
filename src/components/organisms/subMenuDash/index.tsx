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
                if(!subCardInfo.permissions || subCardInfo.permissions?.some(p => permissao[p])) 
                    return <SubDashCard blank={subCardInfo.text.includes('Reportar')} key={subCardInfo.text} subCardInfo={subCardInfo} />
                return null
            })}
        </div>
    )
}

export default SubMenuDash