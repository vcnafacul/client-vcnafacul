import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FORM_GEOLOCATION } from "../../../routes/path";
import getGeolocation from "../../../services/geolocation/getGeolocation";
import { useHomeStore } from "../../../store/home";
import { Geolocation } from "../../../types/geolocation/geolocation";
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
  const [markerActive, setMarkerActive] = useState<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [filterMarkers, setFilterMarkers] = useState<TypeMarker[]>([
    TypeMarker.geo,
    TypeMarker.univPublic,
  ]);
  const { markers, setMarkers } = useHomeStore();
  const [report, setReport] = useState(false);

  function handleClickMarker(index: number) {
    if (boxRef === null) return;
    boxRef.current!.scrollIntoView();
    setMarkerActive(index);
  }

  function handleFilterMarkers(type: TypeMarker) {
    if (filterMarkers.includes(type)) {
      setFilterMarkers((prev) => prev.filter((marker) => marker !== type));
    } else {
      setFilterMarkers((prev) => [...prev, type]);
    }
  }

  const ModalReport = () => {
    return !report ? null : (
      <ReportLC
        entityId={markers.data[markerActive].id}
        type={
          markers.data[markerActive].type === TypeMarker.geo
            ? TypeProblem.GEO
            : TypeProblem.COLLEGE
        }
        isOpen={report}
        handleClose={() => setReport(false)}
        entityName={
          (
            markers.data[markerActive].infos as {
              name: string;
            }
          ).name
        }
      />
    );
  };

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
        markers={markers.data.filter((marker) => {
          if (filterMarkers.includes(marker.type)) {
            return marker;
          }
        })}
        handleClickMarker={handleClickMarker}
      />

      <MapBoxInfo
        boxRef={boxRef}
        boxInfo={
          <div
            className="md:w-[600px] h-fit relative mb-10 mx-auto md:absolute z-40 
          top-5 md:right-10 bg-white opacity-75 rounded-md p-5 flex items-center 
          justify-between flex-col"
          >
            <MapBoxInfoGeo
              geo={markers.data[markerActive]?.infos as Geolocation}
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
      <ModalReport />
    </div>
  );
}

export default Map;
