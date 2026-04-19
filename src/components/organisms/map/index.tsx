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

function Map() {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [filterMarkers, setFilterMarkers] = useState<TypeMarker[]>([
    TypeMarker.geo,
    TypeMarker.univPublic,
  ]);
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
    getGeolocation()
      .then((res) => {
        const geoMarkers = res.data.map((course: Geolocation) => {
          return {
            id: `${course.id}`,
            lat: course.latitude,
            lon: course.longitude,
            type: course.type,
            infos: course,
          };
        });
        setMarkers(geoMarkers);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
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
          <div
            className="md:w-[600px] h-fit relative mb-10 mx-auto md:absolute z-40
          top-5 md:right-10 bg-white opacity-75 rounded-md p-5 flex items-center
          justify-between flex-col"
          >
            <MapBoxInfoGeo
              geo={activeMarker?.infos}
              ctaLink={FORM_GEOLOCATION}
            />
            <Report
              className="w-10 h-10 absolute top-2 right-4 md:bottom-4 md:top-auto cursor-pointer"
              onClick={() => setReport(true)}
            />
          </div>
        }
      />
      <div className="absolute top-4 right-4 sm:left-14 sm:right-auto z-40 bg-grey bg-opacity-70 max-w-80 rounded-sm p-2 flex flex-col">
        <h3 className="self-center text-white font-black">Localizar:</h3>
        {checkMapFilter.map((filter) => (
          <CheckMapFilter
            key={filter.id}
            label={filter.name}
            color={filter.color}
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
