import Text from "../../../components/atoms/text";
import Ul from "../../../components/atoms/ul";
import Button from "../../../components/molecules/button";
import ModalTemplate from "../../../components/templates/modalTemplate"
import { dataModalNew } from "./data";
import data from './data.json'

interface NewSimulateProps {
    handleClose: () => void;
    initialize: () => void;
    title: string;
}

function NewSimulate({ handleClose, initialize, title } : NewSimulateProps ) {

    const info = data[title as keyof typeof data];
    const horas = Math.floor(info.tempo / 60);
    const minutos = info.tempo - (60*horas);

    return (
        <ModalTemplate>
            <div className="bg-white px-20 pt-20 pb-10 rounded-sm ">
                <Text size="secondary">Simulado {title}</Text>
                <Text size="quaternary">
                    Olá! Este é o simulado {info.nome}. Neste modelo, você terá {horas} horas 
                    {minutos > 0 ? ` e ${minutos} minutos` : "" } para responder a {info.questoes} questões objetivas {info.redacao ? "e escrever uma redação." : ""} 
                    As áreas de conhecimento abordadas são:
                </Text>
                <Ul className="my-4" childrens={info.areas.map((area, index) => (
                    <div key={index}>
                        {area.nome}
                        <Ul childrens={area.materias} />
                    </div>
                ))} />
                <Text size="quaternary" className="text-start">
                    Certifique-se de estar preparado para as disciplinas acima. 
                    Lembre-se de que você não poderá parar o tempo do simulado sem finalizá-lo. 
                </Text>
                <Text className="text-start m-0" size="quaternary">Aqui vão algumas dicas para ajudá-lo:</Text>
                <Ul className="ml-4 mb-4" childrens={dataModalNew} />
                <Text size="quaternary" className="font-black text-grey text-start">Bons estudos!</Text>
                <div className="flex justify-end">
                    <div className="flex max-w-[500px] w-full gap-4">
                        <Button typeStyle="secondary" hover onClick={handleClose}>Então volto mais tarde!</Button>
                        <Button hover onClick={initialize}>Ok, vamos lá!</Button>
                    </div>
                </div>
            </div>
        </ModalTemplate>
    )
}

export default NewSimulate