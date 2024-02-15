import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function AboutUsSkeleton() {
    return ( 
    <SkeletonTheme baseColor="#64646426" highlightColor="#222">
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