import { useEffect, useState } from "react";
import { useSimuladoStore } from "../../../store/simulado";

interface CountdownTimerProps {
    className?: string;
}

function CountdownTimer ({ className } : CountdownTimerProps) {
  const { data } = useSimuladoStore()
    const [remainingTime, setRemainingTime] = useState(getRemainingTime());
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    function getRemainingTime() {
      const targetDateTime = new Date(data.started);
      targetDateTime.setHours(targetDateTime.getHours()  + Math.floor(data.duration / 60));
      targetDateTime.setMinutes(targetDateTime.getMinutes() + data.duration - 60*Math.floor(data.duration / 60))
      const currentTime = new Date();
      return targetDateTime.getTime() - currentTime.getTime(); // Removido o Math.max
    }
  
    useEffect(() => {
      if(!data.finish){
        const timerInterval = setInterval(() => {
          const remainingTime = getRemainingTime();
          setRemainingTime(remainingTime);
        }, 1000);
        return () => clearInterval(timerInterval);
      }
    }, [data.started, data.duration, data.finish, getRemainingTime]);
  
    const formatTime = (milliseconds: number) => {
      const ms = milliseconds < 0 ? -milliseconds : milliseconds
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${milliseconds < 0 ? "-" : ""}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    function styleColorTime() {
      return remainingTime < 0 ? 'text-red' : 'text-white'
    }
  
    return (
      <div>
        <p className={`${styleColorTime()} ${className}`}>{formatTime(remainingTime)}</p>
      </div>
    );
  }
  
  export default CountdownTimer;