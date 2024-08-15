import { useEffect, useState } from "react";
import Text from "../../../components/atoms/text";
import { ModalProps } from "../../../components/templates/modalTemplate";
import { getHistoryQuestion } from "../../../services/question/historyQuestion";
import { useAuthStore } from "../../../store/auth";
import {
  AuditLogMS,
  HistoryQuestion,
} from "../../../types/question/historyQuestion";

interface ModalHistoricoProps extends ModalProps {
  id: string;
}

function ModalHistorico({ id }: ModalHistoricoProps) {
  const [history, setHistory] = useState<HistoryQuestion>(
    {} as HistoryQuestion
  );
  const [lastEdit, setLastEdit] = useState<AuditLogMS>({} as AuditLogMS);

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    getHistoryQuestion(token, id)
      .then((data) => {
        setHistory(data);
        setLastEdit(
          data.history.reduce((prev, current) =>
            prev.createdAt > current.createdAt ? prev : current
          )
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  console.log(history);

  const HistoryComponent = () => {
    return history.history &&
      history.history.map((log, index) => (
        <div
          key={index}
          className="p-1 my-1 bg-slate-100 border-2 border-gray-300 rounded"
        >
          {
            Object.entries(JSON.parse(log.changes)).map(
              ([key, value]) => (
                <div className="flex gap-4">
                  <div className="font-bold">{key}:</div>
                  <div className="text-slate-500 font-medium">
                    {value as string}
                  </div>
                </div>
              )
            )
          }
        </div>
      ))
  }

  return (
    <div>
      <div>
        <Text className="justify-start w-fit font-bold" size="tertiary">
          Cadastrado por:
        </Text>
        <div className="flex gap-4 flex-wrap pb-4">
          <div className="bg-slate-100 border-2 border-gray-300 rounded min-w-[300px] h-10 relative">
            <label className="absolute text-xs text-grey left-1 top-0">
              Nome Completo:
            </label>
            <span className="absolute bottom-0 right-2 text-slate-500 font-medium">
              {history?.user?.name}
            </span>
          </div>
          <div className="bg-slate-100 border-2 border-gray-300 rounded min-w-[300px] h-10 relative">
            <label className="absolute text-xs text-grey left-1 top-0">
              Email:
            </label>
            <span className="absolute bottom-0 right-2 text-slate-500 font-medium">
              {history?.user?.email}
            </span>
          </div>
          <div className="bg-slate-100 border-2 border-gray-300 rounded min-w-[300px] h-10 relative">
            <label className="absolute text-xs text-grey left-1 top-0">
              Cadastrado em:
            </label>
            <span className="absolute bottom-0 right-2 text-slate-500 font-medium">
              {history?.createdAt?.split("T")[0]}
            </span>
          </div>
        </div>
      </div>
      <div>
        <Text className="justify-start w-fit font-bold" size="tertiary">
          Última Edição por:
        </Text>
        <div className="flex gap-4">
          <div className="bg-slate-100 border-2 border-gray-300 rounded min-w-[300px] h-10 relative">
            <label className="absolute text-xs text-grey left-1 top-0">
              Nome Completo:
            </label>
            <span className="absolute bottom-0 right-2 text-slate-500 font-medium">
              {lastEdit?.user?.name}
            </span>
          </div>
          <div className="bg-slate-100 border-2 border-gray-300 rounded min-w-[300px] h-10 relative">
            <label className="absolute text-xs text-grey left-1 top-0">
              Email:
            </label>
            <span className="absolute bottom-0 right-2 text-slate-500 font-medium">
              {lastEdit?.user?.email}
            </span>
          </div>
          <div className="bg-slate-100 border-2 border-gray-300 rounded min-w-[300px] h-10 relative">
            <label className="absolute text-xs text-grey left-1 top-0">
              Nome Completo:
            </label>
            <span className="absolute bottom-0 right-2 text-slate-500 font-medium">
              {lastEdit?.createdAt?.split("T")[0]}
            </span>
          </div>
        </div>
      </div>
      <div>
        <Text className="justify-start w-fit font-bold" size="tertiary">
          Histórico:
        </Text>
        <HistoryComponent />
      </div>
      
    </div>
  );
}

export default ModalHistorico;
