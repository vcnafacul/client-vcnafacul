import AboutUs from "../../components/organisms/aboutUs"
import ActionAreas from "../../components/migrate/ActionAreas"
import Features from "../../components/organisms/features"
import Supporters from "../../components/organisms/Supporters"
import BaseTemplate from "../../components/templates/baseTemplate"
import { footer, header, hero } from "./data"

function Home(){
    return (
        <BaseTemplate header={header} hero={hero} footer={footer}>
            <>
                <AboutUs />
                <Features />
                <ActionAreas />
                <Supporters />
            </>
        </BaseTemplate>
    )
}

export default Home