import { useParams } from 'react-router-dom';
import {ReactComponent as Breve } from '../../assets/images/dashboard/undraw_waiting__for_you_ldha.svg'

function EmBreve(){
    const { nomeMateria } = useParams();
    return (
            <div className="flex justify-center items-center flex-col p-10">
                <h1 className="text-h1 text-foreground mb-6 text-center">Em Breve {nomeMateria}</h1>
                <Breve className='w-full sm:w-[767px]' />
            </div>
    )
}

export default EmBreve