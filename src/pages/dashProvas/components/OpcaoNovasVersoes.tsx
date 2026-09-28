/**
 * "Aplicar novas versões das questões automaticamente" (tickets/023, card 09).
 *
 * ⚠️ Não pode deixar dúvida sobre o que faz — e a última frase do tooltip é
 * obrigatória: a correção (sem criar versão) vale para todas as provas, é a
 * exceção que ninguém adivinha (R4).
 */
export const TEXTO_DA_OPCAO =
  "Aplicar novas versões das questões automaticamente";
export const EXPLICACAO_DA_OPCAO =
  "Quando alguém criar uma nova versão de uma questão desta prova, a prova passa a usar a versão nova.";
export const RECOMENDACAO_DA_OPCAO =
  "Desmarcado (recomendado): a prova fica exatamente como você montou; você revisa e decide depois o que atualizar.";
export const EXEMPLO_DA_OPCAO =
  "Ex.: sua prova tem a Questão 12 e um estudante está fazendo a prova. Outro cursinho cria uma nova versão da Questão 12. " +
  "Desmarcado: sua prova continua com a Questão 12 original. Marcado: sua prova passa a usar a nova versão. " +
  "Correções pequenas (sem criar versão) valem para todas as provas.";

export function OpcaoNovasVersoes({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (valor: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          <span className="text-sm font-semibold text-gray-900">
            {TEXTO_DA_OPCAO}
          </span>
          <span
            role="img"
            aria-label="Exemplo"
            title={EXEMPLO_DA_OPCAO}
            className="ml-1 cursor-help text-gray-500"
          >
            ⓘ
          </span>
          <span className="block text-xs text-gray-600 mt-1">
            {EXPLICACAO_DA_OPCAO}
          </span>
          <span className="block text-xs text-gray-600 mt-1">
            {RECOMENDACAO_DA_OPCAO}
          </span>
        </span>
      </label>
    </div>
  );
}

/** O indicador curto, para listas e para quem vê sem poder mudar. */
export const indicadorDeVersoes = (receber?: boolean) =>
  receber ? "🔄 Recebe novas versões" : "🔒 Versões fixas";
