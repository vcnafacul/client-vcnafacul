import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FORM_GEOLOCATION } from "../../../routes/path";
import getGeolocation from "../../../services/geolocation/getGeolocation";
import { useHomeStore } from "../../../store/home";
import { TypeMarker } from "../../../types/map/marker";
import { CheckMapFilter } from "@/components/atoms/checkMapFilter";
import { TypeProblem } from "@/enums/audit/typeProblem";
import { checkMapFilter } from "@/pages/home/data";
import { ReactComponent as Report } from "../../../assets/icons/warning.svg";
import MapBox from "../../molecules/mapBox";
import MapBoxInfo from "../mapBoxInfo";
import MapBoxInfoGeo from "../mapBoxInfo/mapBoxInfoGeo";
import ReportLC from "./modal/report";

const DEFAULT_FILTERS: TypeMarker[] = [TypeMarker.geo, TypeMarker.univPublic];

const INFO_BOX_CLASS =
  "relative mx-auto mb-10 h-fit w-full md:absolute md:right-10 md:top-1/2 md:mb-0 md:h-[490px] md:w-[600px] md:-translate-y-1/2 md:overflow-y-auto z-40 bg-white opacity-75 rounded-md p-5 flex items-center justify-between flex-col";

const FILTER_PANEL_CLASS =
  "absolute top-4 right-4 sm:left-14 sm:right-auto z-40 bg-grey bg-opacity-70 w-72 rounded-md p-4 flex flex-col gap-3";

const REPORT_BUTTON_CLASS =
  "w-10 h-10 absolute top-2 right-4 md:bottom-4 md:top-auto cursor-pointer bg-transparent border-0 p-0";

function Map() {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [filterMarkers, setFilterMarkers] =
    useState<TypeMarker[]>(DEFAULT_FILTERS);
  const { markers, setMarkers } = useHomeStore();
  const [report, setReport] = useState(false);

  const filteredMarkers = useMemo(
    () => markers.data.filter((marker) => filterMarkers.includes(marker.type)),
    [markers.data, filterMarkers]
  );

  const activeMarker = useMemo(
    () =>
      activeMarkerId
        ? markers.data.find((m) => m.id === activeMarkerId) ?? null
        : null,
    [markers.data, activeMarkerId]
  );

  function handleClickMarker(index: number) {
    const marker = filteredMarkers[index];
    if (!marker) return;
    boxRef.current?.scrollIntoView();
    setActiveMarkerId(marker.id);
  }

  function handleFilterMarkers(type: TypeMarker) {
    setFilterMarkers((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  const modalReport =
    report && activeMarker ? (
      <ReportLC
        entityId={activeMarker.id}
        type={
          activeMarker.type === TypeMarker.geo
            ? TypeProblem.GEO
            : TypeProblem.COLLEGE
        }
        isOpen={report}
        handleClose={() => setReport(false)}
        entityName={activeMarker.infos.name}
      />
    ) : null;

  useEffect(() => {
    let mounted = true;
    getGeolocation()
      .then((res) => {
        if (!mounted) return;
        const geoMarkers = res.data.map((course) => ({
          id: `${course.id}`,
          lat: course.latitude,
          lon: course.longitude,
          type: course.type,
          infos: course,
        }));
        setMarkers(geoMarkers);
      })
      .catch((error: Error) => {
        if (!mounted) return;
        toast.error(error.message);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="map" className="relative w-full">
      <MapBox
        className="z-30 h-[530px]"
        zoom={7}
        markers={filteredMarkers}
        handleClickMarker={handleClickMarker}
      />

      <MapBoxInfo
        boxRef={boxRef as RefObject<HTMLDivElement>}
        boxInfo={
          <div className={INFO_BOX_CLASS}>
            <MapBoxInfoGeo
              geo={activeMarker?.infos}
              ctaLink={FORM_GEOLOCATION}
            />
            <button
              type="button"
              aria-label="Reportar problema"
              className={REPORT_BUTTON_CLASS}
              disabled={!activeMarker}
              onClick={() => setReport(true)}
            >
              <Report className="w-full h-full" />
            </button>
          </div>
        }
      />
      <div className={FILTER_PANEL_CLASS}>
        {checkMapFilter.map((filter) => (
          <CheckMapFilter
            key={filter.id}
            label={filter.name}
            type={filter.type}
            checked={filterMarkers.includes(filter.type)}
            onClick={() => handleFilterMarkers(filter.type)}
          />
        ))}
      </div>
      {modalReport}
    </div>
  );
}

export default Map;
