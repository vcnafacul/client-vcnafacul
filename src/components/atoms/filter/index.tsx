import { CiSearch } from "react-icons/ci";

interface FilterProps {
    placeholder: string;
    filtrar: React.ChangeEventHandler<HTMLInputElement>;
}

function Filter ({ filtrar, placeholder } : FilterProps) {
    return (
        <div className="relative w-96 m-4">
            <input className="w-full h-10 px-4 rounded-md outline-none" placeholder={placeholder} onChange={filtrar} />
            <CiSearch className="absolute right-3 top-2 w-6 h-6 fill-grey opacity-75"/>
        </div>
    )
}

export default Filter