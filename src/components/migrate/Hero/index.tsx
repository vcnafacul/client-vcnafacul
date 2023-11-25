import Carousel from '../Carousel';
import BLink from '../../molecules/bLink';
import Text from '../../atoms/text';
import { Slide } from '../../../types/baseTemplate';

export interface HeroProps {
    slides: Slide[]
}

function Hero({ slides }: HeroProps){

    return (
        <Carousel
            spaceBetween={0}
            childrens={slides.map((slide) => (
            <div key={slide.id} style={{background: `${slide.backgroud_color}`}} 
                className='min-h-[750px] sm:min-h-[480px] md:min-h-[600px] w-screen flex justify-center'>
                <div className='container flex flex-col justify-start pt-24 min-h-screen box-border
                    sm:pt-20 sm:min-h-[430px] sm:flex-row sm:items-start sm:justify-between
                    md:min-h-[600px] md:self-center'>
                    <div className='text-white sm:self-start md:w-full md:mb-28 md:self-center justify-start'>
                        <div className='md:transition duration-300 ease-out hover:translate-x-2.5 mx-10 md:mx-0'>
                            <Text size='primary' className='text-white md:text-left text-start mb-6'>{slide.title}</Text>
                            <Text size='tertiary' className='text-white text-start'>{slide.subtitle}</Text>
                        </div>
                        <div className='flex'>
                            {slide.links.map((link) => (
                                <BLink type='tertiary' hover key={link.id} to={link.link}>{link.text}</BLink>
                            ))}
                        </div>
                    </div>
                    <div className='relative max-w-80 w-full my-0 mx-auto sm:mt-1 sm:max-w-max sm:max-h-80
                    md:max-w-md  md:m-0 md:top-0'>
                        {!slide.image ? null : <img className="image" src={slide.image.toString()} alt={slide.title} />} 
                    </div>
                </div>
            </div>
        ))}/>
    )
}

export default Hero