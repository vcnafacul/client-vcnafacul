import { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import leaflet from "leaflet";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactComponent as PointIcon } from "../../../assets/images/home/univ_public.svg";
import { MarkerPoint, TypeMarker } from "../../../types/map/marker";

interface MapBoxProps {
  markers: MarkerPoint[];
  handleClickMarker?: (index: number) => void;
  className?: string;
  zoom?: number;
  center?: LatLngTuple;
  mapEvent?: JSX.Element | null;
}

function MapBox({
  markers,
  handleClickMarker,
  zoom = 7,
  className,
  mapEvent,
  center,
}: MapBoxProps) {
  const [initialPosition, setInitialPosition] = useState<[number, number]>();
  const hasInitialized = useRef(false);

  // Cria uma key única e estável para o MapContainer
  const mapKey = useMemo(() => `map-${Date.now()}-${Math.random()}`, []);

   useEffect(() => {
     // Previne dupla inicialização no StrictMode
     hasInitialized.current = true;
     return () => {
       hasInitialized.current = false;
     };
   }, []);
   if (!hasInitialized) return null;

  useEffect(() => {

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setInitialPosition([latitude, longitude]);
      },
      () => {
        setInitialPosition([-21.4638407, -47.0065925]);
      }
    );
  }, []);

  return (
    <div className="relative h-fit">
      {initialPosition && (
        <MapContainer
          key={mapKey}
          center={center ?? initialPosition}
          zoom={zoom}
          scrollWheelZoom={false}
          className={className}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map(
            (
              mark,
              index //alterar index para o id
            ) => {
              return (
                <Marker
                  key={mark.id}
                  position={[mark.lat, mark.lon]}
                  icon={leaflet.divIcon({
                    className: "w-8 h-8",
                    html: renderToStaticMarkup(
                      <PointIcon
                        className={`${
                          mark.type === TypeMarker.geo
                            ? "fill-blueGeo"
                            : "fill-red"
                        } h-7`}
                      />
                    ),
                    iconAnchor: [16, 32], // <-- Aqui está o ajuste
                  })}
                  eventHandlers={{
                    click: () =>
                      handleClickMarker ? handleClickMarker(index) : null,
                  }}
                />
              );
            }
          )}
          {mapEvent ?? <></>}
        </MapContainer>
      )}
    </div>
  );
}

export default MapBox;
