import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { palette } from "@/lib/palette";

function FooterSkeleton() {
    return ( 
        <SkeletonTheme baseColor={`${palette.neutral[600]}26`} highlightColor={palette.neutral[900]}>
            <footer className="bg-primary py-12 px-0 text-center text-body md:text-left md:pt-14 md:pb-9">
                <div className="container mx-auto flex flex-wrap my-4">
                    <div className="flex w-full justify-between">
                        <div className="flex flex-col items-start gap-4">
                            <div className="flex justify-center items-center gap-4">
                                <Skeleton className="w-10 h-10" borderRadius={50}/>
                                <Skeleton className="w-40"/>
                            </div>
                            <Skeleton className="w-96"/>
                        </div>
                        <Skeleton className="w-60 my-4" count={3}/>
                        <Skeleton className="w-60 my-4" count={3}/>
                        <Skeleton className="w-60 my-4" count={2}/>
                    </div>
                </div>
            </footer>
        </SkeletonTheme>
     );
}

export default FooterSkeleton;