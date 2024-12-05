import { ReactNode } from "react";

interface MapBoxInfoProps {
  boxRef: React.RefObject<HTMLDivElement>;
  boxInfo: ReactNode;
}

function MapBoxInfo({ boxRef, boxInfo }: MapBoxInfoProps) {
  return <div ref={boxRef}>{boxInfo}</div>;
}

export default MapBoxInfo;
