/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentProps } from "react"
import './style.css'

interface UploadButtonProps extends ComponentProps<'input'> {
    onChange: (event: any) => void;
}

function UploadButton({ onChange, ...props } : UploadButtonProps){
    return (
        <div className="w-96">
            <input className="bg-white" type="file" onChange={onChange} {...props} />
        </div>
    )
}

export default UploadButton