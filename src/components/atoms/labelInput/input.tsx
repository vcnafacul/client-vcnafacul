interface LabelInputProps{
    label: string;
}

function LabelInput({ label }: LabelInputProps){
    return (
        <div className="absolute text-grey top-1 left-3 md:top-2 md:left-11 font-bold text-xs">
            {label}
        </div>
    )
}

export default LabelInput