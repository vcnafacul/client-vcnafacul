import { ReactNode } from "react";

interface MapBoxInfoProps {
  boxRef: React.RefObject<HTMLDivElement>;
  boxInfo: ReactNode;
}

function MapBoxInfo({ boxRef, boxInfo }: MapBoxInfoProps) {
  return (
    <div
      ref={boxRef}
      className="md:w-[600px] h-fit relative mb-10 mx-auto md:absolute z-40 
        top-5 md:right-10 bg-white opacity-75 rounded-md p-5 flex items-center 
        justify-between flex-col"
    >
      {boxInfo}
    </div>
  );
}

export default MapBoxInfo;
