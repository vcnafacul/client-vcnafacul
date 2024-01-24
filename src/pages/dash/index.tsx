import { ReactComponent as HeroSvg } from '../../assets/images/dashboard/dashboard-hero.svg'
import Text from '../../components/atoms/text'

function Dash(){
    return (
            <div className="w-full flex justify-center">
                <div className="w-full h-screen flex justify-center items-center">
                    <div className='flex flex-col md:flex-row items-center'>
                        <HeroSvg className='min-w-[500px] w-[30vw] max-w-5xl'/>
                        <div className='w-96'>
                            <Text className='md:text-left'> Bem Vindos ao Você na Facul</Text>
                            <Text className='md:text-left' size='tertiary'>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy</Text>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Dash