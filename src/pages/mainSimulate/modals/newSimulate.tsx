import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { OptionsSelect } from "@/components/ui/options-select";
import Ul from "../../../components/atoms/ul";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SIMULADO_RESPONDER } from "../../../routes/path";
import { getAvailable } from "../../../services/simulado/getAvailable";
import { getSimuladoById } from "../../../services/simulado/getSimuladoById";
import { useAuthStore } from "../../../store/auth";
import { useSimuladoStore } from "../../../store/simulado";
import { dataModalNew } from "./data";
import data from "./data.json";

interface SimuladoDisponivel {
  id: string;
  name: string;
}

interface ModalProps {
  handleClose?: () => void;
}

interface NewSimulateProps extends ModalProps {
  title: string;
  isOpen: boolean;
}

function NewSimulate({ handleClose, title, isOpen }: NewSimulateProps) {
  const [availables, setAvailables] = useState<SimuladoDisponivel[]>([]);
  const [availableSelected, setAvailableSelected] = useState<SimuladoDisponivel>(
    {} as SimuladoDisponivel
  );
  // Só depois da resposta dá para dizer que não há simulado disponível.
  const [carregado, setCarregado] = useState(false);
  const navigate = useNavigate();
  const { simuladoBegin } = useSimuladoStore();

  const info = data[title as keyof typeof data];
  const horas = Math.floor(info.tempo / 60);
  const minutos = info.tempo - 60 * horas;

  const {
    data: { token },
  } = useAuthStore();

  const getSimulate = () => {
    getSimuladoById(availableSelected.id, token)
      .then((res) => {
        simuladoBegin(res);
        navigate(SIMULADO_RESPONDER);
        toast.success(`Iniciado Simulado ${res.title}`);
      })
      .catch((error: Error) => {
        toast.error(error.message);
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
      })
      .finally(() => setCarregado(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    getAvailables();
  }, [getAvailables]);

  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose!()}>
      {/* tickets/059 D21: sem largura própria (texto corrido até a borda da tela), então `lg`. Sem formulário: clicar fora fecha. */}
      <DialogContent size="lg" aria-describedby={undefined}>
        <DialogHeader>
          {/* No celular o seletor ocupa a largura: nomes longos passavam da borda. */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <DialogTitle className="pr-0">Simulado {title}</DialogTitle>
            {availables.length > 0 && (
              <div className="w-full sm:w-auto min-w-0">
                <OptionsSelect<string>
                  aria-label="Simulado disponível"
                  className="sm:min-w-64"
                  options={availables.map((a) => ({
                    value: a.id,
                    label: a.name,
                  }))}
                  value={availableSelected.id}
                  onValueChange={(id) =>
                    setAvailableSelected(
                      availables.find((a) => a.id === id) ?? availableSelected
                    )
                  }
                />
              </div>
            )}
          </div>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-2">
        {carregado && availables.length === 0 && (
          <p className="mb-4 rounded-md bg-muted p-3 text-body text-foreground text-start">
            Nenhum simulado disponível no momento.
          </p>
        )}
        <p className="text-body text-foreground mb-3 text-left">
          Olá! Este é o simulado {info.nome}. Neste modelo, você terá {horas}{" "}
          horas
          {minutos > 0 ? ` e ${minutos} minutos` : ""} para responder a{" "}
          {info.questoes} questões objetivas{" "}
          {info.redacao ? "e escrever uma redação." : ""}
          As áreas de conhecimento abordadas são:
        </p>
        <Ul
          className="my-4"
          childrens={info.areas.map((area, index) => (
            <div key={index}>
              {area.nome}
              <Ul childrens={area.materias} />
            </div>
          ))}
        />
        <p className="text-body text-foreground mb-3 text-start">
          Certifique-se de estar preparado para as disciplinas acima. Lembre-se
          de que você não poderá parar o tempo do simulado sem finalizá-lo.
        </p>
        <p className="text-body text-foreground text-start m-0">
          Aqui vão algumas dicas para ajudá-lo:
        </p>
        <Ul className="ml-4 mb-4" childrens={dataModalNew} />
        <p className="text-body mb-3 font-extrabold text-muted-foreground text-start">
          Bons estudos!
        </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Então volto mais tarde!
          </Button>
          <Button
            variant="cta"
            disabled={availables.length === 0}
            onClick={getSimulate}
          >
            Ok, vamos lá!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewSimulate;
