import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Supporters, { Volunteer } from "../../components/organisms/Supporters"
import AboutUs from "../../components/organisms/aboutUs"
import ActionAreas from "../../components/organisms/actionAreas"
import Features from "../../components/organisms/features"
import HomeNews from "../../components/organisms/homeNews"
import Map from "../../components/organisms/map"
import HeroTemplate from "../../components/templates/heroTemplate"
import { getVolunteers } from "../../services/auth/getVolunteers"
import { about_us, actionAreas, features, footer, header, supporters } from "./data"

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
        <HeroTemplate header={header} footer={footer} headerPosition="fixed" >
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