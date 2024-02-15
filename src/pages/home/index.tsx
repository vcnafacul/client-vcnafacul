import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Supporters, { Volunteer } from "../../components/organisms/Supporters"
import AboutUs, { AboutUsProps } from "../../components/organisms/aboutUs"
import AboutUsSkeleton from "../../components/organisms/aboutUsSkeleton.tsx"
import ActionAreas, { ActionProps } from "../../components/organisms/actionAreas"
import Features, { FeaturesProps } from "../../components/organisms/features"
import HomeNews from "../../components/organisms/homeNews"
import Map from "../../components/organisms/map"
import HeroTemplate from "../../components/templates/heroTemplate"
import { getVolunteers } from "../../services/auth/getVolunteers"
import { getAboutUs } from "../../services/directus/home/about_us.ts"
import { footer, header, supporters } from "./data"
import { getFeature } from "../../services/directus/home/features.ts"
import FeatureSkeleton from "../../components/organisms/featuresSkeleton/index.tsx"
import ActionAreasSkeleton from "../../components/organisms/actionAreasSkeleton/index.tsx"
import { getActions } from "../../services/directus/home/actions.ts"

function Home(){

    
    const [volunteers, setVolunteers] = useState<Volunteer[]>([])
    const [aboutUs, setAboutUs] = useState<AboutUsProps | null>(null)
    const [features, setFeatures] = useState<FeaturesProps | null>(null)
    const [actionAreas, setActionAreas] = useState<ActionProps | null>(null)
    

    useEffect(() => {
        getVolunteers()
            .then(res => {
                setVolunteers(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })

        if(!aboutUs) {
            getAboutUs()
                .then(res => {
                    setAboutUs(res)
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }
        if(!features) {
            getFeature()
                .then(res => {
                    setFeatures(res)
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }
        if(!actionAreas) {
            getActions()
                .then(res => {
                    console.log(res)
                    setActionAreas(res)
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }
    }, [aboutUs, features])

      
    return (
        <HeroTemplate header={header} footer={footer} headerPosition="fixed" >
            <>
                {aboutUs ? <AboutUs {...aboutUs} /> : <AboutUsSkeleton />}
                <HomeNews />
                { features ? <Features {...features}/> : <FeatureSkeleton />}
                { actionAreas ? <ActionAreas {...actionAreas}/> : <ActionAreasSkeleton />}
                <Supporters {...supporters} volunteers={volunteers} />
                <Map />
            </>
        </HeroTemplate>
    )
}

export default Home