import { useState } from "react";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import { FieldValueMetric } from "../../atoms/fieldValueMetric";
import Text from "../../atoms/text";
import Button from "../../molecules/button";

interface HeaderSimulateHistoricoProps {
    historic: HistoricoDTO
}

export function HeaderSimulateHistorico({ historic } : HeaderSimulateHistoricoProps) {
    
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const finished = historic.simulado.tipo.quantidadeTotalQuestao === historic.questoesRespondidas
    return ( 
        <div className="my-6">
            <div className="flex items-center justify-around my-4">
                <Text className="text-white w-fit m-0">Simulado do Enem</Text>
                <div className="w-40">
                    <Button >Voltar</Button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 grid-rows-3 justify-center">
                <div className="flex items-center flex-col col-span-1 sm:col-start-1 sm:row-start-2 sm:row-span-2">
                    <div>
                        <FieldValueMetric field="Caderno" value={historic.simulado.tipo.nome} />
                        <FieldValueMetric field="Ano" value="2019" />
                        <FieldValueMetric field="Quantidade" value={`${historic.simulado.tipo.quantidadeTotalQuestao} questões`} />
                        <FieldValueMetric field="Tempo" value={getFormatingTime(historic.tempoRealizado)} />
                        <div className="text-white flex gap-1">
                            <span>Status</span>
                            <span>{finished ? 'Completo' : 'Incompleto'}</span>
                            <span>{getStatusIcon(finished ? StatusEnum.Approved : StatusEnum.Rejected)}</span>
                        </div>
                    </div>
                </div>
                <Text size="secondary" className="text-white m-0 row-start-2 col-span-2 sm:row-start-1 sm:col-span-1 sm:col-start-2 flex justify-center items-center select-none">Aproveitamento</Text>
                <div className="flex items-center flex-col col-span-2 row-start-3 sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:row-span-2 relative">
                    <div onMouseEnter={() => setShowDetails(true)}
                    onMouseLeave={() => setShowDetails(false)}>
                        <FieldValueMetric field="Geral" value={`${(historic.aproveitamento.geral * 100).toFixed(2)}%`} />
                        {historic.aproveitamento.materias.map(m => (
                            <FieldValueMetric field={m.nome} value={`${(m.aproveitamento * 100).toFixed(2)}%`} />
                        ))}
                    </div>
                    <div className={`transition-opacity duration-300 ${showDetails ? 'opacity-100' : 'opacity-0'} absolute z-10 right-0 bottom-0 bg-marine p-4 rounded border border-white`}>
                        {historic.aproveitamento.frentes.map(f => (
                                <FieldValueMetric field={f.nome} value={`${(f.aproveitamento * 100).toFixed(2)}%`} />
                            ))}
                    </div>
                </div>
                <div className="flex justify-center items-center col-span-1 sm:col-start-3 sm:row-start-2 sm:row-span-2">
                    <div>
                        <FieldValueMetric field="Acertos" value={`${historic.respostas.filter(r => r.alternativaCorreta === r.alternativaEstudante).length} questões`} />
                        <FieldValueMetric field="Erradas" value={`${historic.respostas.filter(r => r.alternativaCorreta !== r.alternativaEstudante).length} questões`} />
                        <FieldValueMetric field="Não respondidas" value={`${historic.respostas.filter(r => r.alternativaEstudante === undefined).length} questões`} />
                    </div>
                </div>
            </div>
        </div>
     );
}
