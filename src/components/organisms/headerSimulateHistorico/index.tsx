import { useState } from "react";
import { FieldValueMetric } from "../../atoms/fieldValueMetric";
import Text from "../../atoms/text";
import Button from "../../molecules/button";

export function HeaderSimulateHistorico() {
    
    const [showDetails, setShowDetails] = useState<boolean>(false);
    return ( 
        <div className="my-6">
            <div className="flex items-center justify-around my-4">
                <Text className="text-white w-fit m-0">Simulado do Enem</Text>
                <div className="w-40">
                    <Button >Voltar</Button>
                </div>
            </div>
            <div className="grid grid-cols-3 grid-rows-3 justify-center">
                <div className="flex items-center flex-col col-start-1 row-start-2 row-span-2">
                    <div>
                        <FieldValueMetric field="Caderno" value="Linguagens" />
                        <FieldValueMetric field="Ano" value="2019" />
                        <FieldValueMetric field="Quantidade" value="45 questões" />
                        <FieldValueMetric field="Tempo" value="2h16min" />
                        <FieldValueMetric field="Status" value="Concluido" />
                    </div>
                </div>
                <Text size="secondary" className="text-white m-0 col-start-2">Aproveitamento</Text>
                <div className="flex items-center flex-col col-span-1 col-start-2 row-start-2 row-span-2 relative">
                    <div onMouseEnter={() => setShowDetails(true)}
                        onMouseLeave={() => setShowDetails(false)}>
                        <FieldValueMetric field="Geral" value="49%" />
                        <FieldValueMetric field="Literatura" value="32%" />
                        <FieldValueMetric field="Leitura e Produção de Texto" value="50%" />
                        <FieldValueMetric field="Gramática" value="75%" />
                        <FieldValueMetric field="Inglê/Espanhol" value="70%" />
                    </div>
                    <div className={`transition-opacity duration-300 ${showDetails ? 'opacity-100' : 'opacity-0'} absolute right-0 bg-marine p-4 rounded border border-white`}>
                        <FieldValueMetric field="Geral" value="49%" />
                        <FieldValueMetric field="Literatura" value="32%" />
                        <FieldValueMetric field="Leitura e Produção de Texto" value="50%" />
                        <FieldValueMetric field="Gramática" value="75%" />
                        <FieldValueMetric field="Inglê/Espanhol" value="70%" />
                    </div>
                </div>
                <div className="flex justify-center items-center col-span-1 col-start-3 row-start-2 row-span-2">
                    <div>
                        <FieldValueMetric field="Acertos" value="22 questões" />
                        <FieldValueMetric field="Erradas" value="10 questões" />
                        <FieldValueMetric field="Não respondidas" value="13 questões" />
                    </div>
                </div>
            </div>
        </div>
     );
}
