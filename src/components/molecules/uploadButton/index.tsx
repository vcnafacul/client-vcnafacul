/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentProps } from "react"
import './style.css'

interface UploadButtonProps extends ComponentProps<'input'> {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

function UploadButton({ onChange, className, ...props } : UploadButtonProps){
    return (
        <div  className={`my-4 ${className}`}>
            <label className="border-2 border-orange px-4 py-3 text-orange rounded cursor-pointer" htmlFor="file">{props.placeholder}</label>
            <input id='file' className="bg-white" type="file" onChange={onChange} {...props} style={{ display: 'none' }} />
        </div>
    )
}

export default UploadButton