/* eslint-disable @typescript-eslint/no-explicit-any */
interface ToggleProps {
  name: string;
  checked: boolean;
  handleCheck: (name: string, checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({ name, checked, handleCheck, disabled = false }: ToggleProps) {
  const handle = (event: any) => {
    const { name, checked } = event.target;
    handleCheck(name, checked);
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer ">
      <input
        type="checkbox"
        name={name}
        className="sr-only peer"
        defaultChecked={checked}
        checked={checked}
        onChange={handle}
        disabled={disabled}
      />
      <div
        className={`w-7 h-4 bg-gray-300 rounded-full 
            peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
            after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all 
            dark:border-gray-600 ${disabled ? "peer-checked:bg-stone-400 bg-stone-200" : "peer-checked:bg-green2"}`}
      ></div>
    </label>
  );
}

export default Toggle;
