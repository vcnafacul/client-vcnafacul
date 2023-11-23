import Carousel from '../Carousel';
import { backgroundGradients } from './data';
import BLink from '../../atoms/bLink';
import { HeroProps } from './types';

function Hero({ slides }: HeroProps){

    return (
        <Carousel
            spaceBetween={0}
            childrens={slides.map((slide) => (
            <div key={slide.id} style={{background: `${backgroundGradients[slide.id - 1]}`}} 
                className='min-h-[750px] sm:min-h-[480px] md:min-h-[600px] w-screen flex justify-center'>
                <div className='container flex flex-col justify-start pt-24 min-h-screen box-border
                    sm:pt-20 sm:min-h-[430px] sm:flex-row sm:items-start sm:justify-between
                    md:min-h-[600px] md:self-center'>
                    <div className='text-white sm:self-start md:w-full md:mb-28 md:self-center justify-start'>
                        <div className='md:transition duration-300 ease-out hover:translate-x-2.5 mx-10 md:mx-0'>
                            <h2 className='text-4xl mb-6 leading-10 md:text-5xl md:mb-1.5 text-start font-bold md:leading-snug'>{slide.title}</h2>
                            <p className='text-base md:text-xl leading-6 md:leading-9 mb-6 md:mb-14 text-start'>{slide.subtitle}</p>
                        </div>
                        <div className='flex'>
                            {slide.links.map((link) => (
                                <BLink type='tertiary' key={link.id} to={link.link}>{link.text}</BLink>
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