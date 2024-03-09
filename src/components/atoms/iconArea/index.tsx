interface IconAreaProps {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    className?: string;
}

function IconArea({ icon, className } : IconAreaProps) {
    const Icone = icon;
    return (
        <div className={`w-16 h-16 rounded-full flex justify-center items-center ${className}`}>
            <Icone className="m-2 p-1" />
        </div>
    )
}

export default IconArea