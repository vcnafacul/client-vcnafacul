import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export function HeroSkeleton() {
    return ( 
        <SkeletonTheme baseColor="#64646426" highlightColor="#222">
            <div className='min-h-[750px] sm:min-h-[480px] md:min-h-[600px] w-screen flex justify-center bg-marine'>
                <div className='container flex flex-col justify-start pt-24 min-h-screen box-border
                        sm:pt-20 sm:min-h-[430px] sm:flex-row sm:items-start sm:justify-between
                        md:min-h-[600px] md:self-center'>
                            <div className='sm:self-start md:w-full md:mb-28 md:self-center justify-start flex gap-4 flex-col'>
                                <Skeleton width={500} height={50}/>
                                <Skeleton width={700} count={2} />
                                <div className="flex gap-4">
                                    <Skeleton width={100} />
                                    <Skeleton width={100} />
                                </div>
                        </div>
                </div>
            </div>
        </SkeletonTheme>
     );
}

