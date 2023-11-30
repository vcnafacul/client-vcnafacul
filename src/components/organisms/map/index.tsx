import MapBox from "../../molecules/mapBox"
import { Geolocation } from "../../../types/geolocation/geolocation";
import { useEffect, useRef, useState } from "react";
import getGeolocation from "../../../services/geolocation/getGeolocation";
import MapBoxInfo from "../mapBoxInfo";


function Map() {
    const [markerActive, setMarkerActive] = useState<number>(0);
    const [markers, setMarkers] = useState<Geolocation[]>([]);
    const boxRef = useRef<HTMLDivElement>(null);

    function handleClickMarker(index: number) {
        if(boxRef === null) return;
        boxRef.current!.scrollIntoView();
        setMarkerActive(index);
    }
    
    useEffect(() => {
        getGeolocation()
            .then(res => {
                setMarkers(
                    res!.map((course : Geolocation) => {
                        return {
                            ...course,
                            whatsapp: course.whatsapp.replace(/[^0-9]+/g, ""),
                        };
                    })
                )
            })
        .catch(() => setMarkers([]))
    }, []);

    
    return (
        <div id="map" className="w-full relative">
            <MapBox markers={markers.map(geo => {
                return {
                    id: geo.id,
                    lat: geo.latitude,
                    lon: geo.longitude
                }
            })} className="h-[60vh] z-30" handleClickMarker={handleClickMarker}/>
            <MapBoxInfo boxRef={boxRef} geo={markers[markerActive]} ctaLink="#" />
        </div>
    )
}

export default Map