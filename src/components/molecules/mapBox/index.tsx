import { LatLngTuple } from "leaflet";
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import leaflet from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export interface MarkerPoint {
  id: number;
  lat: number;
  lon: number;
}

interface MapBoxProps {
  markers: MarkerPoint[];
  handleClickMarker?: (index: number) => void;
  className?: string;
  zoom?: number;
  center?: LatLngTuple;
  mapEvent?: JSX.Element;
}

const DefaultIcon = leaflet.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

leaflet.Marker.prototype.options.icon = DefaultIcon;




function MapBox({ markers, handleClickMarker, zoom = 7, className, mapEvent, center }: MapBoxProps) {
  const [initialPosition, setInitialPosition] = useState<[number, number]>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    }, () => {
      toast.info("Não foi possível determinar sua localização")
      setInitialPosition([-21.4638407, -47.0065925]);
    })
  }, []);

  return (
    <div className="relative">
      {initialPosition && (
        <MapContainer center={center ?? initialPosition} zoom={zoom} scrollWheelZoom={false}
        className={className}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((mark, index) => //alterar index para o id
          <Marker
            key={mark.id}
            position={[mark.lat, mark.lon]}
            eventHandlers={{
              click: () => handleClickMarker ? handleClickMarker(index) : null
            }}
          />
        )}
        { mapEvent ?? <></> }
      </MapContainer>
      )}
    </div>
  )
}

export default MapBox
