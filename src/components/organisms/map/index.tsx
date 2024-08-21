import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { checkMapFilter } from "../../../pages/home/data";
import { FORM_GEOLOCATION } from "../../../routes/path";
import getGeolocation from "../../../services/geolocation/getGeolocation";
import { useHomeStore } from "../../../store/home";
import { Geolocation } from "../../../types/geolocation/geolocation";
import { TypeMarker } from "../../../types/map/marker";
import { University } from "../../../types/university/university";
import { DiffTime } from "../../../utils/diffTime";
import { CheckMapFilter } from "../../atoms/checkMapFilter";
import MapBox from "../../molecules/mapBox";
import MapBoxInfo from "../mapBoxInfo";
import MapBoxInfoUnivPublic from "../mapBoxInfo/MapBoxInfoUnivPublic";
import MapBoxInfoGeo from "../mapBoxInfo/mapBoxInfoGeo";

function Map() {
  const [markerActive, setMarkerActive] = useState<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [filterMarkers, setFilterMarkers] = useState<TypeMarker[]>([
    TypeMarker.geo,
    TypeMarker.univPublic,
  ]);
  const { markers, setMarkers } = useHomeStore();

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

  useEffect(() => {
    const geoMarkersCache = markers.data.filter(
      (m) => m.type === TypeMarker.geo
    );
    if (geoMarkersCache.length === 0 || DiffTime(markers.updated, 8)) {
      const UnivMarker = markers.data.filter(
        (m) => m.type === TypeMarker.univPublic
      );
      getGeolocation()
        .then((res) => {
          const geoMarkers = res.data.map((course: Geolocation) => {
            return {
              id: `${course.id} ${TypeMarker.geo}`,
              lat: course.latitude,
              lon: course.longitude,
              type: TypeMarker.geo,
              infos: course,
            };
          });
          const newMarkers = [...geoMarkers, ...UnivMarker];
          setMarkers(newMarkers);
        })
        .catch((error: Error) => {
          toast.error(error.message);
          setMarkers(UnivMarker);
        });
    }
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
          markers.data[markerActive]?.type === TypeMarker.geo ? (
            <MapBoxInfoGeo
              geo={markers.data[markerActive]?.infos as Geolocation}
              ctaLink={FORM_GEOLOCATION}
            />
          ) : (
            <MapBoxInfoUnivPublic
              univPublic={markers.data[markerActive]?.infos as University}
            />
          )
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
    </div>
  );
}

export default Map;
