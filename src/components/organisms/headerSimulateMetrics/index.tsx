import { FieldValueMetric } from "../../atoms/fieldValueMetric";
import Text from "../../atoms/text";
import Button from "../../molecules/button";

export function HeaderSimulateMetrics() {
    return ( 
        <div className="my-6">
            <div className="flex items-center justify-around my-4">
                <Text className="text-white w-fit m-0">Simulado do Enem</Text>
                <div className="w-40">
                    <Button >Voltar</Button>
                </div>
            </div>
            <div className="grid grid-cols-3 justify-center">
                <div className="flex items-center flex-col">
                    <div>
                        <FieldValueMetric field="Caderno" value="Linguagens" />
                        <FieldValueMetric field="Ano" value="2019" />
                        <FieldValueMetric field="Quantidade" value="45 questões" />
                        <FieldValueMetric field="Tempo" value="2h16min" />
                        <FieldValueMetric field="Status" value="Concluido" />
                    </div>
                </div>
                <div className="flex items-center flex-col">
                    <div>
                        <Text size="quaternary" className="text-white m-0">Aproveitamento</Text>
                        <FieldValueMetric field="Geral" value="49%" />
                        <FieldValueMetric field="Literatura" value="32%" />
                        <FieldValueMetric field="Leitura e Produção de Texto" value="50%" />
                        <FieldValueMetric field="Gramática" value="75%" />
                        <FieldValueMetric field="Inglê/Espanhol" value="70%    " />
                    </div>
                </div>
                <div className="flex justify-center items-center">
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
