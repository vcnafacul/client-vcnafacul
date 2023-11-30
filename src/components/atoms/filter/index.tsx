import { CiSearch } from "react-icons/ci";

interface FilterProps {
    placeholder: string;
    filtrar: React.ChangeEventHandler<HTMLInputElement>;
}

function Filter ({ filtrar, placeholder } : FilterProps) {
    return (
        <div>
            <input placeholder={placeholder} onChange={filtrar} />
            <CiSearch />
        </div>
    )
}

export default Filter