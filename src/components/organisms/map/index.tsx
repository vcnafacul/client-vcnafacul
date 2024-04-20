import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FORM_GEOLOCATION } from "../../../routes/path";
import getGeolocation from "../../../services/geolocation/getGeolocation";
import { Geolocation } from "../../../types/geolocation/geolocation";
import MapBox from "../../molecules/mapBox";
import MapBoxInfo from "../mapBoxInfo";


function Map() {
  const [markerActive, setMarkerActive] = useState<number>(0);
  const [markers, setMarkers] = useState<Geolocation[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  function handleClickMarker(index: number) {
    if (boxRef === null) return;
    boxRef.current!.scrollIntoView();
    setMarkerActive(index);
  }

  useEffect(() => {
    getGeolocation()
      .then(res => {
        setMarkers(
          res.data.map((course: Geolocation) => {
            return {
              ...course,
              whatsapp: course.whatsapp.replace(/[^0-9]+/g, ""),
            };
          })
        )
      })
      .catch((error: Error) => {
        toast.error(error.message)
        setMarkers([])
      })
  }, []);

  return (
    <div id="map" className="w-full relative">
      <MapBox
        className="z-30 h-[530px]"
        zoom={7}
        markers={markers.map(geo => {
          return {
            id: geo.id as number,
            lat: geo.latitude,
            lon: geo.longitude
          }
        })}
        handleClickMarker={handleClickMarker}
      />

      <MapBoxInfo
        boxRef={boxRef}
        geo={markers[markerActive]}
        ctaLink={FORM_GEOLOCATION}
      />
    </div>
  )
}

export default Map
