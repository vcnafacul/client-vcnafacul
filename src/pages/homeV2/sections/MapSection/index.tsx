// client-vcnafacul/src/pages/homeV2/sections/MapSection/index.tsx
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { TypeMarker } from "../../../../types/map/marker";
import { TypeProblem } from "@/enums/audit/typeProblem";
import getGeolocation from "../../../../services/geolocation/getGeolocation";
import { useHomeStore } from "../../../../store/home";
import MapBox from "../../../../components/molecules/mapBox";
import ReportLC from "../../../../components/organisms/map/modal/report";
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { MapFilterCard } from "./MapFilterCard";
import { MapInfoCard } from "./MapInfoCard";

const DEFAULT_FILTERS: TypeMarker[] = [TypeMarker.geo, TypeMarker.univPublic];

export const MapSection: SectionComponent<null> = () => {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [filterMarkers, setFilterMarkers] = useState<TypeMarker[]>(DEFAULT_FILTERS);
  const { markers, setMarkers } = useHomeStore();
  const [report, setReport] = useState(false);

  const filteredMarkers = useMemo(
    () => markers.data.filter((m) => filterMarkers.includes(m.type)),
    [markers.data, filterMarkers],
  );
  const activeMarker = useMemo(
    () =>
      activeMarkerId
        ? markers.data.find((m) => m.id === activeMarkerId) ?? null
        : null,
    [markers.data, activeMarkerId],
  );

  function handleClickMarker(index: number) {
    const m = filteredMarkers[index];
    if (!m) return;
    setActiveMarkerId(m.id);
  }
  function handleFilterMarkers(type: TypeMarker) {
    setFilterMarkers((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  useEffect(() => {
    let mounted = true;
    getGeolocation()
      .then((res) => {
        if (!mounted) return;
        const geoMarkers = res.data.map((c) => ({
          id: `${c.id}`,
          lat: c.latitude,
          lon: c.longitude,
          type: c.type,
          infos: c,
        }));
        setMarkers(geoMarkers);
      })
      .catch((err: Error) => {
        if (!mounted) return;
        toast.error(err.message);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative w-full [&>div:first-child]:h-full"
      style={{ height: "100vh", minHeight: 600 }}
    >
      <MapBox
        className="z-30 w-full h-full"
        zoom={7}
        markers={filteredMarkers}
        handleClickMarker={handleClickMarker}
      />
      <MapFilterCard filterMarkers={filterMarkers} onToggle={handleFilterMarkers} />
      <MapInfoCard
        activeMarker={activeMarker}
        boxRef={boxRef as RefObject<HTMLDivElement>}
        onReport={() => setReport(true)}
        onClose={() => setActiveMarkerId(null)}
      />
      {report && activeMarker && (
        <ReportLC
          entityId={activeMarker.id}
          type={activeMarker.type === TypeMarker.geo ? TypeProblem.GEO : TypeProblem.COLLEGE}
          isOpen={report}
          handleClose={() => setReport(false)}
          entityName={activeMarker.infos.name}
        />
      )}
    </div>
  );
};

export default MapSection;
