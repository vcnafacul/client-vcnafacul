/* eslint-disable use-isnan */
import Text from "../../../components/atoms/text";
import PropValue from "../../../components/molecules/PropValue";
import BLink from "../../../components/molecules/bLink";
import { Prova } from "../../../dtos/prova/prova";

interface ShowProvaProps {
  prova: Prova;
}

function ShowProva({ prova }: ShowProvaProps) {
  const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;
  const percentCadastradas =
    (prova.totalQuestaoCadastradas / prova.totalQuestao) * 100;
  const percentValidadas =
    (prova.totalQuestaoValidadas / prova.totalQuestaoCadastradas) * 100;

  return (
    <>
      <div className="bg-white p-10 flex flex-col items-start rounded-lg">
        <Text>{prova.nome}</Text>
        <PropValue prop="Edição" value={prova.edicao} />
        <PropValue prop="Ano" value={prova.ano.toString()} />
        <PropValue prop="Aplicação" value={prova.aplicacao.toString()} />
        <PropValue prop="Exame" value={prova.exame} />
        <PropValue prop="Questões Esperadas" value={`${prova.totalQuestao}`} />
        <PropValue
          prop="Questões Cadastradas"
          value={`${prova.totalQuestaoCadastradas} - ${percentCadastradas}%`}
        />
        <PropValue
          prop="Questões Aprovadas"
          value={`${prova.totalQuestaoValidadas} - ${
            percentValidadas === Number.NaN ? 0 : 0
          }%`}
        />
        <div className="self-end my-4">
          <BLink
            to={`${VITE_BASE_FTP}${prova.filename}`}
            target="_blank"
            className="flex"
            type="quaternary"
          >
            Download Prova
          </BLink>
        </div>
      </div>
    </>
  );
}

export default ShowProva;
