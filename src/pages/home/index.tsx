import AboutUs from "../../components/organisms/aboutUs"
import ActionAreas from "../../components/organisms/actionAreas"
import Features from "../../components/organisms/features"
import Map from "../../components/organisms/map"
import Supporters from "../../components/organisms/Supporters"
import HeroTemplate from "../../components/templates/heroTemplate"
import { about_us, actionAreas, features, footer, header, hero, supporters } from "./data"
import HomeNews from "../../components/organisms/homeNews"

function Home(){
    
      
    return (
        <HeroTemplate header={header} hero={hero} footer={footer} headerPosition="fixed" >
            <>
                <AboutUs {...about_us} />
                <HomeNews />
                <Features {...features}/>
                <ActionAreas {...actionAreas}/>
                <Supporters {...supporters} />
                <Map />
            </>
        </HeroTemplate>
    )
}

export default Home