import Text from '../../components/atoms/text'
import { useNavigate, useParams } from "react-router-dom";
import { DataMateriaProps, dataMateria } from './data';
import { useCallback, useEffect, useState } from 'react';
import { FrenteDto, SubjectDto } from '../../dtos/content/contentDtoInput';
import SimpleCardColor from '../../components/atoms/simpleCardColor';
import { useAuthStore } from '../../store/auth';
import { getFrentes } from '../../services/content/getFrentes';
import { toast } from 'react-toastify';
import { getSubjects } from '../../services/content/getSubjects';
import { CONTENT } from '../../routes/path';

function Materia(){
    const { nomeMateria } = useParams();
    const { data: { token } } = useAuthStore();
    const navigate = useNavigate()

    const [frentes, setFrentes] = useState<FrenteDto[]>([])
    const [frenteSelected, setFrenteSelected] = useState<FrenteDto>()

    const [subjects, setSubjects] = useState<SubjectDto[]>([])

    const materiaPageInfo = dataMateria[nomeMateria as keyof DataMateriaProps]
    const Icon = materiaPageInfo.image

    const Frentes = useCallback(() => {
        if(frentes.length === 0) return null
        return (
            <>
                <Text className='w-fit'>O que estudar?</Text>
                <div className='flex gap-8 pt-4 pb-8 select-none flex-wrap'>
                    {frentes.map(frente => {
                        if(frente.lenght > 0){
                            return (
                                <SimpleCardColor 
                                    onClick={() => setFrenteSelected(frente)}
                                    selected={frente.id !== frenteSelected!.id} 
                                    name={frente.name} 
                                    key={frente.id} />
                            )
                        }
                    })}
                </div>
                <div className='w-full border'></div>
            </>
        )
    },[frenteSelected, frentes])

    const Temas = useCallback(() => {
        if(!frenteSelected || subjects.length === 0) return null
        return (
            <div className='pt-4 pb-8'>
                <Text size='secondary' className='w-fit'>E qual tema?</Text>
                <div className='flex flex-wrap gap-4'>
                    {subjects.map(subject => {
                        if(subject.lenght > 0){
                            return (
                                <SimpleCardColor name={subject.name}  key={subject.id} 
                                    onClick={() => {
                                        console.log(`dashboard/${CONTENT}/${subject.name.replace(' ', '')}/${subject.id}`)
                                        navigate(`/dashboard/${CONTENT}/${subject.name.replace(' ', '')}/${subject.id}`)
                                    }}/>
                            )
                        }
                        return (
                            <SimpleCardColor disable name={subject.name} key={subject.id} />
                        )
                    })}
                </div>
            </div>
        )
    }, [frenteSelected, navigate, subjects])

    useEffect(() => {
        getFrentes(materiaPageInfo.id, token)
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

    useEffect(() => {
        if(frenteSelected){
            getSubjects(frenteSelected.id, token)
            .then(res => {
                setSubjects(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            });
        }
    }, [frenteSelected, token])
    
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