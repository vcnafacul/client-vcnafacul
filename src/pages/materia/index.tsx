import Text from '../../components/atoms/text'
import { useNavigate, useParams } from "react-router-dom";
import { DataMateriaProps, dataMateria } from './data';
import { useCallback, useEffect, useState } from 'react';
import SimpleCardColor from '../../components/atoms/simpleCardColor';
import { useAuthStore } from '../../store/auth';
import { getFrentesWithContent } from '../../services/content/getFrentes';
import { toast } from 'react-toastify';
import { CONTENT } from '../../routes/path';
import { Frente } from '../../types/content/frenteContent';

function Materia(){
    const { nomeMateria } = useParams();
    const { data: { token } } = useAuthStore();
    const navigate = useNavigate()

    const [frentes, setFrentes] = useState<Frente[]>([])
    const [frenteSelected, setFrenteSelected] = useState<Frente>()

    const materiaPageInfo = dataMateria[nomeMateria as keyof DataMateriaProps]
    const Icon = materiaPageInfo.image

    const Frentes = useCallback(() => {
        if(frentes.length === 0) return null
        return (
            <>
                <Text className='w-fit'>O que estudar?</Text>
                <div className='flex gap-8 pt-4 pb-8 select-none flex-wrap'>
                    {frentes.map(frente => <SimpleCardColor 
                        onClick={() => setFrenteSelected(frente)}
                        selected={frente.id !== frenteSelected!.id} 
                        name={frente.name} 
                        key={frente.id} />)}
                </div>
                <div className='w-full border'></div>
            </>
        )
    },[frenteSelected, frentes])

    const Temas = useCallback(() => {
        if(!frenteSelected) return null
        return (
            <div className='pt-4 pb-8'>
                <Text size='secondary' className='w-fit'>E qual tema?</Text>
                <div className='flex flex-wrap gap-4'>
                    {frenteSelected.subject.map(subject => 
                        <SimpleCardColor name={subject.name}  key={subject.id} 
                        onClick={() => {
                            navigate(`/dashboard/${CONTENT}/${subject.name.replace(' ', '')}/${subject.id}`)
                        }}/>
                    )}
                </div>
            </div>
        )
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frenteSelected])

    useEffect(() => {
        getFrentesWithContent(materiaPageInfo.id, token)
            .then(res => {
                setFrentes(res)
                if(res.length > 0){
                    setFrenteSelected(res[0])
                }
                else {
                    setFrenteSelected(undefined)
                }
            })
            .catch((error: Error) => {
                toast.error(error.message)
            });
    }, [materiaPageInfo.id, nomeMateria, token])

    return (
        <div className='py-4 container mx-auto px-4'>
            <div className='flex items-center justify-between flex-col-reverse md:flex-row'>
                <div className=''>
                    <Text className=' text-start'>Bem vindo ao mundo {materiaPageInfo.title}</Text>
                    <Text size='tertiary' className='text-start m-0 font-semibold'>
                        Veja dicas de como estudar {materiaPageInfo.title} <a className='text-blue-400' href="#">clicando aqui</a>
                    </Text>
                </div>
                <Icon className='w-[500px] h-[400px]' />
            </div>
            <div>
                <Frentes />
                <Temas />
            </div>
        </div>
    )
}

export default Materia