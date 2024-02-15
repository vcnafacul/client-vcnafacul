import { useState } from "react";
import Youtube from "react-youtube";
import { ReactComponent as PlayIcon } from "../../../assets/icons/play-circle.svg";
import { ReactComponent as SquarePink } from "../../../assets/icons/square-pink.svg";
import { ReactComponent as TabletImage } from "../../../assets/icons/tablet.svg";
import { ReactComponent as TriangleGreyBorder } from "../../../assets/icons/triangle-grey-border.svg";
import { ReactComponent as TriangleYellow } from "../../../assets/icons/triangle-yellow.svg";

import Text from "../../atoms/text";
import './styles.css';

export interface AboutUsProps {
    title: string;
    description: string,
    thumbnail: string;
    videoID: string;
}

function AboutUs({title, description, videoID, thumbnail} : AboutUsProps){
    const [videoComponent, setVideoComponent] = useState(<></>);

    const videoOptions = {
        height: "410",
        width: "540",
        playerVars: {
            rel: 0,
            autoplay: 1,
        },
    };

    const handleClick = () => {
        setVideoComponent(
            <Youtube
                className="video z-40 absolute "
                videoId={videoID}
                opts={videoOptions}
            />
        );
    }

    return (
        <div className="bg-white">
            <div className="relative h-1" id="about-us"></div>
            <div className="container mx-auto mt-10 mb-14 text-center sm:flex sm:justify-between sm:items-center sm:text-left sm:my-44">
                <div className="relative mr-14 box-border py-10 pr-0 pl-5 mt-5 sm:pr-10 sm:pl-10 sm:mt-0 sm:min-w-[60%] md:pb-5 md:pl-16">
                    <TriangleGreyBorder className="graphism-header triangle-border-header" />
                    <TriangleYellow className="graphism-header triangle-yellow-header" />
                    <SquarePink className="graphism-header square-pink-header" />
                    <div className="flex justify-center items-center bg-blue max-w-[640px] max-h-[390px]">
                        <div className="relative flex justify-center items-center w-96">
                            <TabletImage className="tablet absolute z-20 max-w-[640px] md:w-[640px]" />
                            <img src={thumbnail} alt="" className="video relative z-30 md:max-w-[440px] sm:max-w-[320px] max-w-[80%]"/>
                        </div>
                        <button className="absolute z-40 border-none cursor-pointer" onClick={handleClick}>
                            <PlayIcon className="z-30 bg-gray-900 rounded-full border-none cursor-pointer opacity-30 transition-opacity duration-200 ease-linear hover:opacity-100" />
                        </button>
                        {videoComponent}
                    </div>
                </div>
                <div>
                    <Text size="secondary" className="text-start">{title}</Text>
                    <Text size="tertiary" className="text-start">{description}</Text>
                </div>
            </div>
        </div>
    )
}

export default AboutUs