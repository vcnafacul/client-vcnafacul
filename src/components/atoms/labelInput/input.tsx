interface LabelInputProps{
    label: string;
}

function LabelInput({ label }: LabelInputProps){
    return (
        <div className="absolute text-grey top-2 left-[21px] font-bold text-xs">
            {label}
        </div>
    )
}

export default LabelInput