import AboutUs from "../../components/organisms/aboutUs"
import ActionAreas from "../../components/organisms/actionAreas"
import Features from "../../components/organisms/features"
import Map from "../../components/organisms/map"
import Supporters, { Volunteer } from "../../components/organisms/Supporters"
import HeroTemplate from "../../components/templates/heroTemplate"
import { about_us, actionAreas, features, footer, header, hero, supporters } from "./data"
import HomeNews from "../../components/organisms/homeNews"
import { useEffect, useState } from "react"
import { getVolunteers } from "../../services/auth/getVolunteers"
import { toast } from "react-toastify"

function Home(){

    
    const [volunteers, setVolunteers] = useState<Volunteer[]>([])

    useEffect(() => {
        getVolunteers()
            .then(res => {
                setVolunteers(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }, [])
      
    return (
        <HeroTemplate header={header} hero={hero} footer={footer} headerPosition="fixed" >
            <>
                <AboutUs {...about_us} />
                <HomeNews />
                <Features {...features}/>
                <ActionAreas {...actionAreas}/>
                <Supporters {...supporters} volunteers={volunteers} />
                <Map />
            </>
        </HeroTemplate>
    )
}

export default Home