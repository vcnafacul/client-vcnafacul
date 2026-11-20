import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { palette } from "@/lib/palette";

function ActionAreasSkeleton() {
    return (  
        <SkeletonTheme baseColor={`${palette.neutral[600]}26`} highlightColor={palette.neutral[900]}>
            <div className="container mx-auto flex justify-center items-center flex-col gap-4">
                <Skeleton className="w-96 h-8" />
                <Skeleton className="w-[500px] h-4" />
                <Skeleton className="w-60 h-4 mx-4" count={3} inline/>
                <Skeleton className="w-60 h-60 mx-4" count={5} inline/>

            </div>
        </SkeletonTheme>
    );
}

export default ActionAreasSkeleton;