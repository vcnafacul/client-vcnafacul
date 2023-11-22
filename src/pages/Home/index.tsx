import AboutUs from "../../components/migrate/AboutUs"
import ActionAreas from "../../components/migrate/ActionAreas"
import Features from "../../components/migrate/Features"
import { header } from "../../components/migrate/Header/data"
import { hero } from "../../components/migrate/Hero/data"
import Supporters from "../../components/migrate/Supporters"
import BaseTemplate from "../../components/templates/baseTemplate"

function Home(){
    return (
        <BaseTemplate header={header} hero={hero} footer={''}>
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