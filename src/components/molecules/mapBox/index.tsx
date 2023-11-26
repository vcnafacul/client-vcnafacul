import { LatLngTuple } from "leaflet";
import { useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet"
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

export interface MarkerPoint {
    id: number;
    lat: number;
    lon: number;
}

interface MapBoxProps{
    markers: MarkerPoint[];
    handleClickMarker?: (index: number) => void;
    className?: string;
    zoom?: number
}

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapBox({markers, handleClickMarker, zoom, className} : MapBoxProps){
    const [mapCenter] = useState<LatLngTuple>([-21.4712828, -47.0439503]);
    
    return (
        <div className="relative">
            <MapContainer center={mapCenter} zoom={zoom ?? 7} scrollWheelZoom={false} 
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
                    ></Marker>
                )}
            </MapContainer>
        </div>
    )
}

export default MapBox