import { useParams } from 'react-router-dom';
import {ReactComponent as Breve } from '../../assets/images/dashboard/undraw_waiting__for_you_ldha.svg'
import Text from '../../components/atoms/text'

function EmBreve(){
    const { nomeMateria } = useParams();
    return (
            <div className="flex justify-center items-center flex-col p-10">
                <Text>Em Breve {nomeMateria}</Text>
                <Breve className='w-full sm:w-[767px]' />
            </div>
    )
}

export default EmBreve