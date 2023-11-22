import AboutUs from "../../components/AboutUs"
import ActionAreas from "../../components/ActionAreas"
import Features from "../../components/Features"
import Header from "../../components/Header"
import { header } from "../../components/Header/data"
import Hero from "../../components/Hero"
import Supporters from "../../components/Supporters"

function Home(){
    return (
        <div className="flex flex-col">
            <Header {...header} />
            <Hero />
            <AboutUs />
            <Features />
            <ActionAreas />
            <Supporters />
        </div>
    )
}

export default Home