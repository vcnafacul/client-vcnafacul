/* eslint-disable @typescript-eslint/no-explicit-any */
import { CiSearch } from "react-icons/ci";

interface FilterProps {
    placeholder: string;
    filtrar: React.ChangeEventHandler<HTMLInputElement>;
    className?: string;
    search?: boolean;
    defaultValue?: any;
    disabled?: boolean;
    
}

function Filter ({ filtrar, placeholder, className, search = true, defaultValue, disabled } : FilterProps) {
    return (
        <div className={`${className} relative w-11/12 sm:w-96 m-4`}>
            <input disabled={disabled} className="w-full h-10 px-4 rounded-md outline-none" placeholder={placeholder} onChange={filtrar} defaultValue={defaultValue}/>
            {search ? <CiSearch className="absolute right-3 top-2 w-6 h-6 fill-grey opacity-75"/> : <></>}
        </div>
    )
}

export default Filter