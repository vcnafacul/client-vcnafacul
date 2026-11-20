import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { palette } from "@/lib/palette";

function AboutUsSkeleton() {
    return ( 
    <SkeletonTheme baseColor={`${palette.neutral[600]}26`} highlightColor={palette.neutral[900]}>
        <div className="container mx-auto flex justify-center my-20">
            <Skeleton className="w-96 h-60" />
            <div className="px-4 gap-4 flex flex-col">
                <Skeleton className="w-96 max-w-[500px] h-10" />
                <Skeleton className="w-80 max-w-[400px]" count={9} />
            </div>
        </div>
    </SkeletonTheme>
);
}

export default AboutUsSkeleton;