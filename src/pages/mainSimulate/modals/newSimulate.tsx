import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  OptionProps,
  SelectOption,
} from "../../../components/atoms/selectOption";
import Text from "../../../components/atoms/text";
import Ul from "../../../components/atoms/ul";
import Button from "../../../components/molecules/button";
import { SIMULADO_RESPONDER } from "../../../routes/path";
import { getAvailable } from "../../../services/simulado/getAvailable";
import { getSimuladoById } from "../../../services/simulado/getSimuladoById";
import { useAuthStore } from "../../../store/auth";
import { useSimuladoStore } from "../../../store/simulado";
import { dataModalNew } from "./data";
import data from "./data.json";
import { ModalProps } from "../../../components/templates/modalTemplate";

interface NewSimulateProps extends ModalProps {
  title: string;
}

function NewSimulate({ handleClose, title }: NewSimulateProps) {
  const [availables, setAvailables] = useState<OptionProps[]>([]);
  const [availableSelected, setAvailableSelected] = useState<OptionProps>(
    {} as OptionProps
  );
  const navigate = useNavigate();
  const { simuladoBegin } = useSimuladoStore();

  const info = data[title as keyof typeof data];
  const horas = Math.floor(info.tempo / 60);
  const minutos = info.tempo - 60 * horas;

  const {
    data: { token },
  } = useAuthStore();

  const getSimulate = () => {
    getSimuladoById(availableSelected.id as string, token)
      .then((res) => {
        simuladoBegin(res);
        navigate(SIMULADO_RESPONDER);
        toast.success(`Iniciado Simulado ${res.title}`);
      })
      .catch((error: Error) => {
        toast.error(
          `Erro ao buscar simulado ${availableSelected.id} - Error ${error.message}`
        );
      });
  };

  const getAvailables = useCallback(() => {
    getAvailable(title, token)
      .then((res) => {
        if (res.length > 0) {
          const availables = res.map((item) => ({
            id: item._id,
            name: item.nome,
          }));
          setAvailables(availables);
          setAvailableSelected(availables[0]);
        }
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    getAvailables();
  }, [getAvailables]);

  return (
    <>
      <div className="bg-white px-20 pt-20 pb-10 rounded-sm ">
        <div className="flex items-center justify-between gap-4">
          <Text className="text-left" size="secondary">
            Simulado {title}
          </Text>
          <SelectOption options={availables} setState={setAvailableSelected} />
        </div>
        <Text className="text-left" size="quaternary">
          Olá! Este é o simulado {info.nome}. Neste modelo, você terá {horas}{" "}
          horas
          {minutos > 0 ? ` e ${minutos} minutos` : ""} para responder a{" "}
          {info.questoes} questões objetivas{" "}
          {info.redacao ? "e escrever uma redação." : ""}
          As áreas de conhecimento abordadas são:
        </Text>
        <Ul
          className="my-4"
          childrens={info.areas.map((area, index) => (
            <div key={index}>
              {area.nome}
              <Ul childrens={area.materias} />
            </div>
          ))}
        />
        <Text size="quaternary" className="text-start">
          Certifique-se de estar preparado para as disciplinas acima. Lembre-se
          de que você não poderá parar o tempo do simulado sem finalizá-lo.
        </Text>
        <Text className="text-start m-0" size="quaternary">
          Aqui vão algumas dicas para ajudá-lo:
        </Text>
        <Ul className="ml-4 mb-4" childrens={dataModalNew} />
        <Text size="quaternary" className="font-black text-grey text-start">
          Bons estudos!
        </Text>
        <div className="flex justify-end">
          <div className="flex max-w-[500px] w-full gap-4">
            <Button typeStyle="secondary" hover onClick={handleClose}>
              Então volto mais tarde!
            </Button>
            <Button
              disabled={availables.length === 0}
              hover
              onClick={getSimulate}
            >
              Ok, vamos lá!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewSimulate;
