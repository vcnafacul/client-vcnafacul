import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import AboutUs, { AboutUsProps } from "../../components/organisms/aboutUs"
import ActionAreas, { ActionProps } from "../../components/organisms/actionAreas"
import Features, { FeaturesProps } from "../../components/organisms/features"
import HomeNews from "../../components/organisms/homeNews"
import Map from "../../components/organisms/map"
import Supporters, { SupportersSponsor, Volunteer } from "../../components/organisms/supporters/index.tsx"
import HeroTemplate from "../../components/templates/heroTemplate"
import { HomeContext } from "../../context/homeContext.tsx"
import { getVolunteers } from "../../services/auth/getVolunteers.ts"
import { getAboutUs } from "../../services/directus/home/about_us.ts"
import { getActions } from "../../services/directus/home/actions.ts"
import { getFeature } from "../../services/directus/home/features.ts"
import { getSponsor } from "../../services/directus/home/sponsors.ts"

function Home(){
    const [ aboutUs, setAboutUs ] = useState<AboutUsProps | null>(null)
    const [ features, setFeatures ] = useState<FeaturesProps | null>(null)
    const [ actionAreas, setActionAreas ] = useState<ActionProps | null>(null)
    const [ supporters, setSupporters ] = useState<SupportersSponsor | null>(null)
    const [ volunteers, setVolunteers ] = useState<Volunteer[]>([])
    
    useEffect(() => {
        if(!aboutUs) {
            getAboutUs()
            .then(res => {
                setAboutUs(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }, [aboutUs])

    useEffect(() => {
        if(!features) {
            getFeature()
            .then(res => {
                setFeatures(res)
            })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
            }
    }, [features])

    useEffect(() => {
        if(!actionAreas) {
            getActions()
            .then(res => {
                setActionAreas(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }, [actionAreas])

    useEffect(() => {
        if(!supporters) {
            getSponsor()
            .then(res => {
                setSupporters(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }, [supporters])

    useEffect(() => {
        if(volunteers.length === 0){
            getVolunteers()
            .then(res => {
                setVolunteers(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }, [volunteers])

    return (
        <HomeContext.Provider value={{ aboutUs, features, actionAreas, supporters, volunteers}} >
            <HeroTemplate headerPosition="fixed">
                <>
                    <AboutUs  />
                    <HomeNews />
                    <Features />
                    <ActionAreas />
                    <Supporters />
                    <Map />
                </>
            </HeroTemplate>
        </HomeContext.Provider>
    )
}

export default Home