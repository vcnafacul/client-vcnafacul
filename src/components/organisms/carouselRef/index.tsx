import Carousel from "../../molecules/carousel"

interface CarouselRefProps{
    childrens: React.ReactNode[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    breakpoints?: any;
    className?: string;
}

function CarouselRef({ childrens, breakpoints, className }: CarouselRefProps){
    
    return (
        <div className={`z-0 ${className}`}>
            <Carousel className="" breakpoints={breakpoints} pagination dynamicBullets childrens={childrens} />
        </div>
    )
}

export default CarouselRef