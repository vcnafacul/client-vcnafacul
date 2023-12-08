/* eslint-disable @typescript-eslint/no-explicit-any */
interface ToggleProps {
    checked: boolean;
    handleCheck: (check: boolean) => void;
}

function Toggle({ checked, handleCheck } : ToggleProps) {

    const handle = (event: any) => {
        handleCheck(event.target.value)
    }

    return (
        <label className="relative inline-flex items-center cursor-pointer ">
            <input type="checkbox"  className="sr-only peer" defaultChecked={checked} onChange={handle}/>
            <div className="w-7 h-4 bg-gray-200 rounded-full 
            peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
            after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all 
            dark:border-gray-600 peer-checked:bg-green2"></div>
        </label>
    )
}

export default Toggle