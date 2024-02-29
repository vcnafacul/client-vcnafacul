import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as HeroSvg } from '../../assets/images/dashboard/dashboard-hero.svg';
import Text from '../../components/atoms/text';
import { Subtitle, Welcome } from './data';

function Dash() {
  return (
     <div className=" relative min-h-[calc(100vh-76px)] flex items-end justify-center">
        <TriangleGreen className="rotate-180 absolute top-0 left-80 w-40" />
        <div className='flex flex-col gap-4 items-center justify-center md:flex-row'>
          <HeroSvg className='min-w-[500px] w-[30vw] max-w-5xl mt-24' />
          <div className='w-96'>
            <Text className='md:text-left'>{Welcome}</Text>
            <Text className='md:text-left' size='tertiary'>{Subtitle}</Text>
          </div>
        </div>
     </div>
  )
}

export default Dash
