/* eslint-disable @typescript-eslint/no-explicit-any */
import { CiSearch } from "react-icons/ci";

export interface FilterProps {
    placeholder: string;
    filtrar: React.ChangeEventHandler<HTMLInputElement>;
    className?: string;
    search?: boolean;
    defaultValue?: any;
    disabled?: boolean;
    keyDown?: () => void;
}

function Filter ({ filtrar, placeholder, className, search = true, defaultValue, disabled, keyDown } : FilterProps) {
    return (
        <div className={`${className} relative  m-4`}>
            <input 
                disabled={disabled} 
                className="w-full h-10 px-4 rounded-md outline-none shadow-md" 
                placeholder={placeholder} 
                onChange={filtrar} 
                defaultValue={defaultValue}
                onKeyDown={(e: any) => {
                    if(e.key === 'Enter' && keyDown) keyDown()
                }}
                />
            {search ? <CiSearch className="absolute right-3 top-2 w-6 h-6 fill-grey opacity-75"/> : <></>}
        </div>
    )
}

export default Filter