import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

import leaflet, { LatLngTuple } from "leaflet";
import { BookOpen, Landmark, LucideIcon } from "lucide-react";
import { JSX, useEffect, useId, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { MarkerPoint, TypeMarker } from "../../../types/map/marker";

const FALLBACK_POSITION: [number, number] = [-21.4638407, -47.0065925];

const PIN_COLORS: Record<TypeMarker, string> = {
  [TypeMarker.geo]: "#2563EB",
  [TypeMarker.univPublic]: "#B91C1C",
};

const PIN_ICONS: Record<TypeMarker, LucideIcon> = {
  [TypeMarker.geo]: BookOpen,
  [TypeMarker.univPublic]: Landmark,
};

const PIN_LABELS: Record<TypeMarker, string> = {
  [TypeMarker.geo]: "Cursinho popular",
  [TypeMarker.univPublic]: "Universidade pública",
};

interface MarkerPinProps {
  type: TypeMarker;
  size?: number;
}

export function MarkerPin({ type, size = 36 }: MarkerPinProps) {
  const color = PIN_COLORS[type];
  const Icon = PIN_ICONS[type];
  const height = Math.round(size * (44 / 36));
  const iconSize = Math.round(size * (18 / 36));
  const iconOffset = Math.round(size * (9 / 36));
  return (
    <div
      style={{
        width: size,
        height,
        position: "relative",
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))",
      }}
    >
      <svg
        viewBox="0 0 36 44"
        width={size}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 0C8.06 0 0 8.06 0 18c0 13 18 26 18 26s18-13 18-26C36 8.06 27.94 0 18 0z"
          fill={color}
        />
        <circle cx="18" cy="18" r="11" fill="#ffffff" />
      </svg>
      <div style={{ position: "absolute", top: iconOffset, left: iconOffset }}>
        <Icon size={iconSize} color={color} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function buildPinHtml(type: TypeMarker): string {
  return renderToStaticMarkup(<MarkerPin type={type} />);
}

function buildClusterIcon(count: number): leaflet.DivIcon {
  return leaflet.divIcon({
    html: `<div style="
      width:40px;height:40px;border-radius:50%;
      background:rgba(37,99,235,0.85);color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:14px;
      border:3px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 4px rgba(0,0,0,0.3);
    ">${count}</div>`,
    className: "",
    iconSize: [40, 40],
  });
}

interface ClusteredMarkersProps {
  markers: MarkerPoint[];
  handleClickMarker?: (index: number) => void;
}

function ClusteredMarkers({
  markers,
  handleClickMarker,
}: ClusteredMarkersProps) {
  const map = useMap();
  const handlerRef = useRef(handleClickMarker);

  useEffect(() => {
    handlerRef.current = handleClickMarker;
  });

  useEffect(() => {
    const clusterGroup = leaflet.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => buildClusterIcon(cluster.getChildCount()),
    });

    markers.forEach((mark, index) => {
      const m = leaflet.marker([mark.lat, mark.lon], {
        title: PIN_LABELS[mark.type],
        icon: leaflet.divIcon({
          html: buildPinHtml(mark.type),
          className: "",
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        }),
      });
      m.on("click", () => handlerRef.current?.(index));
      clusterGroup.addLayer(m);
    });

    map.addLayer(clusterGroup);
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, markers]);

  return null;
}

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
  const mapKey = useId();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setInitialPosition([latitude, longitude]);
      },
      () => setInitialPosition(FALLBACK_POSITION)
    );
  }, []);

  if (!initialPosition) return <div className="relative h-fit" />;

  return (
    <div className="relative h-fit">
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
        <ClusteredMarkers
          markers={markers}
          handleClickMarker={handleClickMarker}
        />
        {mapEvent}
      </MapContainer>
    </div>
  );
}

export default MapBox;
