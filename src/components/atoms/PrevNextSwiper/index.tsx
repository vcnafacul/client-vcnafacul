import { useSwiper } from 'swiper/react'
import { ReactComponent as Arrow } from '../../../assets/icons/arrow.svg'

interface PrevNextSwiperProps {
    className?: string;
    fill?: string;
}

function PrevNextSwiper({ className, fill } : PrevNextSwiperProps) {
    const swiper = useSwiper()
    const arrowFill = fill === undefined ? 'fill-grey' : 'fill-white'
    const classNameArrow = `w-10 cursor-pointer ${arrowFill}`
    return (
        <div className={`w-full flex justify-between pr-8 z-10 ${className}`}>
            <Arrow onClick={() => { swiper.slidePrev() }} className={`rotate-180 ${classNameArrow}`} />
            <Arrow onClick={() => { swiper.slideNext() }} className={classNameArrow}/>
        </div>
    )
}

export default PrevNextSwiper