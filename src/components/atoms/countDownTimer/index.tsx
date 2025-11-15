import { memo, useEffect, useMemo, useState } from "react";
import { useSimuladoStore } from "../../../store/simulado";

interface CountdownTimerProps {
  className?: string;
}

function CountdownTimer({ className }: CountdownTimerProps) {
  const { data } = useSimuladoStore();
  const [remainingTime, setRemainingTime] = useState(0);

  // Calcula a data/hora final do simulado (memoizado para não recalcular sempre)
  const targetDateTime = useMemo(() => {
    const target = new Date(data.started);
    target.setHours(target.getHours() + Math.floor(data.duration / 60));
    target.setMinutes(
      target.getMinutes() +
        (data.duration - 60 * Math.floor(data.duration / 60))
    );
    return target.getTime();
  }, [data.started, data.duration]);

  useEffect(() => {
    // Função para calcular tempo restante
    const calculateRemainingTime = () => {
      const currentTime = new Date().getTime();
      return targetDateTime - currentTime;
    };

    // Define o tempo inicial
    setRemainingTime(calculateRemainingTime());

    // Se não finalizou, atualiza a cada segundo
    if (!data.finish) {
      const timerInterval = setInterval(() => {
        setRemainingTime(calculateRemainingTime());
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [targetDateTime, data.finish]);

  const formatTime = (milliseconds: number) => {
    const ms = milliseconds < 0 ? -milliseconds : milliseconds;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${milliseconds < 0 ? "-" : ""}${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const styleColorTime = () => {
    return remainingTime < 0 ? "text-red" : "text-white";
  };

  return (
    <div>
      <p className={`${styleColorTime()} ${className}`}>
        {formatTime(remainingTime)}
      </p>
    </div>
  );
}

// Memoiza o componente para evitar re-renders desnecessários
export default memo(CountdownTimer);
