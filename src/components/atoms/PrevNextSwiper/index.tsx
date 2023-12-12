import { useSwiper } from 'swiper/react'
import { ReactComponent as Arrow } from '../../../assets/icons/arrow.svg'

function PrevNextSwiper() {
    const swiper = useSwiper()

    console.log(swiper)

    return (
        <div className='relative w-full flex justify-between  pr-8'>
            <Arrow onClick={() => { console.log('prev'); swiper.slidePrev() }} className="fill-grey w-10 rotate-180 cursor-pointer" />
            <Arrow onClick={() => { swiper.slideNext() }} className="fill-grey w-10 cursor-pointer"/>
        </div>
    )
}

export default PrevNextSwiper