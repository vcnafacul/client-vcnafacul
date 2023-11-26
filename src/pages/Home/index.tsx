import AboutUs from "../../components/organisms/aboutUs"
import ActionAreas from "../../components/organisms/actionAreas"
import Features from "../../components/organisms/features"
import Map from "../../components/organisms/map"
import Supporters from "../../components/organisms/Supporters"
import BaseTemplate from "../../components/templates/baseTemplate"
import { about_us, actionAreas, features, footer, header, hero, supporters } from "./data"

function Home(){
    return (
        <BaseTemplate header={header} hero={hero} footer={footer}>
            <>
                <AboutUs {...about_us} />
                <Features {...features}/>
                <ActionAreas {...actionAreas}/>
                <Supporters {...supporters} />
                <Map />
            </>
        </BaseTemplate>
    )
}

export default Home