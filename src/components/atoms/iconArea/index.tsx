interface IconAreaProps {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    className?: string;
}

function IconArea({ icon, className } : IconAreaProps) {
    const Icone = icon;
    return (
        <div className={`w-16 rounded-full flex justify-center items-center ${className}`}>
            <Icone className="m-2 p-1 w-12 h-12 fill-white" />
        </div>
    )
}

export default IconArea