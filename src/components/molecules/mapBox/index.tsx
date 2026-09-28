import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./mapBox.css";

/*
  ⚠️ **O Leaflet ANTES do markercluster.** O plugin é UMD e se pendura no `L`
  global que o Leaflet cria ao carregar. Com o plugin primeiro, este arquivo só
  funcionava se outro módulo tivesse carregado o Leaflet antes — foi o que
  quebrou o app inteiro ("L is not defined") quando a ordem dos imports do
  PlatformRoutes mudou (tickets/022, card 10).
*/
import leaflet, { LatLngTuple } from "leaflet";
import "leaflet.markercluster";
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

function MobileGestureHandler() {
  const map = useMap();
  useEffect(() => {
    const isTouchMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (!isTouchMobile) return;

    map.dragging.disable();
    const container = map.getContainer();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        map.dragging.enable();
      } else {
        map.dragging.disable();
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) map.dragging.disable();
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [map]);
  return null;
}

interface ClusteredMarkersProps {
  markers: MarkerPoint[];
  handleClickMarker?: (index: number) => void;
  onMarkerClick?: (id: string) => void;
  activeId?: string | null;
}

function ClusteredMarkers({
  markers,
  handleClickMarker,
  onMarkerClick,
  activeId,
}: ClusteredMarkersProps) {
  const map = useMap();
  const handlerRef = useRef(handleClickMarker);
  const idHandlerRef = useRef(onMarkerClick);
  const porId = useRef(new Map<string, leaflet.Marker>());

  useEffect(() => {
    handlerRef.current = handleClickMarker;
    idHandlerRef.current = onMarkerClick;
  });

  useEffect(() => {
    const indice = porId.current;
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
      m.on("click", () => {
        handlerRef.current?.(index);
        // O id é o deste marcador, fixado agora — não depende de o array de
        // markers ser o mesmo na hora do clique (o índice dependia).
        idHandlerRef.current?.(mark.id);
      });
      indice.set(mark.id, m);
      clusterGroup.addLayer(m);
    });

    map.addLayer(clusterGroup);
    return () => {
      indice.clear();
      map.removeLayer(clusterGroup);
    };
  }, [map, markers]);

  // Pin destacado (ex.: hover no card da lista).
  // ⚠️ Dentro de um cluster o pin não tem elemento na tela; quando o zoom
  // desfaz o cluster, o Leaflet cria o elemento de novo, sem a classe. Por
  // isso o destaque é reaplicado a cada `add` do marcador.
  useEffect(() => {
    if (!activeId) return;
    const m = porId.current.get(activeId);
    if (!m) return;
    const destacar = () => m.getElement()?.classList.add("pin-ativo");
    m.setZIndexOffset(1000);
    destacar();
    m.on("add", destacar);
    return () => {
      m.off("add", destacar);
      m.setZIndexOffset(0);
      m.getElement()?.classList.remove("pin-ativo");
    };
  }, [activeId, markers]);

  return null;
}

interface MapBoxProps {
  markers: MarkerPoint[];
  handleClickMarker?: (index: number) => void;
  /** Clique no pin pelo id (mais seguro que o índice). Opcional. */
  onMarkerClick?: (id: string) => void;
  /** Pin destacado. Opcional. */
  activeId?: string | null;
  /** A home deixa desligado para não prender o scroll da página. */
  scrollWheelZoom?: boolean;
  className?: string;
  zoom?: number;
  center?: LatLngTuple;
  mapEvent?: JSX.Element | null;
}

function MapBox({
  markers,
  handleClickMarker,
  onMarkerClick,
  activeId,
  scrollWheelZoom = false,
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
        scrollWheelZoom={scrollWheelZoom}
        className={className}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MobileGestureHandler />
        <ClusteredMarkers
          markers={markers}
          handleClickMarker={handleClickMarker}
          onMarkerClick={onMarkerClick}
          activeId={activeId}
        />
        {mapEvent}
      </MapContainer>
    </div>
  );
}

export default MapBox;
