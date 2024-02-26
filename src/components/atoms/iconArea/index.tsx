interface IconAreaProps {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    className?: string;
}

function IconArea({ icon, className } : IconAreaProps) {
    const Icone = icon;
    return (
        <div className={`w-24 flex justify-center items-center`}>
            <Icone className={`fill-white h-16 rounded-full m-2 p-2 ${className}`} />
        </div>
    )
}

export default IconArea