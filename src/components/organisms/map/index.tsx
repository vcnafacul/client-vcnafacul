import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FORM_GEOLOCATION } from "../../../routes/path";
import getGeolocation from "../../../services/geolocation/getGeolocation";
import { useHomeStore } from "../../../store/home";
import { Geolocation } from "../../../types/geolocation/geolocation";
import { DiffTime } from "../../../utils/diffTime";
import MapBox from "../../molecules/mapBox";
import MapBoxInfo from "../mapBoxInfo";

function Map() {
  const [markerActive, setMarkerActive] = useState<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const { markers, setMarkers } = useHomeStore();

  function handleClickMarker(index: number) {
    if (boxRef === null) return;
    boxRef.current!.scrollIntoView();
    setMarkerActive(index);
  }

  useEffect(() => {
    if (markers.data.length === 0 || DiffTime(markers.updated, 8)) {
      getGeolocation()
        .then((res) => {
          setMarkers(
            res.data.map((course: Geolocation) => {
              return {
                ...course,
                whatsapp: course.whatsapp.replace(/[^0-9]+/g, ""),
              };
            })
          );
        })
        .catch((error: Error) => {
          toast.error(error.message);
          setMarkers([]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="map" className="relative w-full">
      <MapBox
        className="z-30 h-[530px]"
        zoom={7}
        markers={markers.data.map((geo) => {
          return {
            id: geo.id as number,
            lat: geo.latitude,
            lon: geo.longitude,
          };
        })}
        handleClickMarker={handleClickMarker}
      />

      <MapBoxInfo
        boxRef={boxRef}
        geo={markers.data[markerActive]}
        ctaLink={FORM_GEOLOCATION}
      />
    </div>
  );
}

export default Map;
