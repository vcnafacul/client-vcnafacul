interface LabelInputProps{
    label: string;
    /** Campo compacto (h-11): o rótulo sobe para não encostar no texto. */
    compacto?: boolean;
}

function LabelInput({ label, compacto = false }: LabelInputProps){
    return (
        <div className={`absolute text-muted-foreground ${compacto ? "top-1 text-caption" : "top-2 text-caption"} left-[21px] font-bold bg-white`}>
            {label}
        </div>
    )
}

export default LabelInput