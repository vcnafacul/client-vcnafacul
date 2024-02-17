import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

interface HeaderSkeletonProps {
    className?: string;
}

export function HeaderSkeleton({ className } : HeaderSkeletonProps) {

    return (
        <SkeletonTheme baseColor="#64646473" highlightColor="#222">
            <header className={`${className}`}>
                <div className="container md:mx-auto flex justify-between md:justify-center md:gap-20 items-center">
                    <Skeleton className="w-10 h-2 md:hidden" count={3}/>
                    <div className="flex justify-center items-center gap-4">
                        <Skeleton className="w-10 h-10" borderRadius={50}/>
                        <Skeleton className="w-32"/>
                    </div>
                    <div className="hidden md:inline-block">
                        <Skeleton className="w-32 h-5 mx-4" count={3} inline/>
                        <Skeleton className="w-20 h-5 mx-2" count={2} inline />
                    </div>
                </div>
            </header>
        </SkeletonTheme>
    )
}