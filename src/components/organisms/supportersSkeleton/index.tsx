import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { palette } from "@/lib/palette";

function SupportersSkeleton() {
    return ( 
        <SkeletonTheme baseColor={`${palette.neutral[600]}26`} highlightColor={palette.neutral[900]}>
            <div className="container mx-auto flex justify-center items-center flex-col gap-4 my-20">
                <Skeleton className="w-96 h-8" />
                <Skeleton className="w-[500px] h-4" />
                <Skeleton className="w-60 h-32 mx-32" count={3} inline/>
            </div>
        </SkeletonTheme>
     );
}

export default SupportersSkeleton;