import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function FeatureSkeleton() {
    return ( 
        <SkeletonTheme baseColor="#64646426" highlightColor="#222">
            <div className="container mx-auto flex justify-center flex-col items-center gap-4 my-10">
                <Skeleton className="w-96 h-10" />
                <Skeleton className="w-96 h-4" />
                <div className="flex gap-4">
                <Skeleton className="w-96 h-4 my-5" count={5} />
                <Skeleton className="w-96 h-72" />
                </div>
            </div>
        </SkeletonTheme>
     );
}

export default FeatureSkeleton;