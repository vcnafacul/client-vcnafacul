import { useParams } from 'react-router-dom';
import {ReactComponent as Breve } from '../../assets/images/dashboard/undraw_waiting__for_you_ldha.svg'
import Text from '../../components/atoms/text'
import DashTemplate from '../../components/templates/dashTemplate'
import { headerDash } from '../dash/data'

function EmBreve(){
    const { nomeMateria } = useParams();
    return (
        <DashTemplate header={headerDash} hasMenu>
            <div className="flex justify-center items-center flex-col p-10">
                <Text>Em Breve {nomeMateria}</Text>
                <Breve className='w-full sm:w-[767px]' />
            </div>
        </DashTemplate>
    )
}

export default EmBreve