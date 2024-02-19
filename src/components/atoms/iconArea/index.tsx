interface IconAreaProps {
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    className?: string;
}

function IconArea({ icon, className } : IconAreaProps) {
    const Icone = icon;
    return (
        <div className={`w-24 rounded-full flex justify-center items-center ${className}`}>
            <Icone className="fill-white w-9/12" />
        </div>
    )
}

export default IconArea