//O Elemento que receber o ToolTip deve ter a classe group

interface Props {
  children: string;
}

export function ToolTip({ children }: Props) {
  return (
    <div
      className="absolute -right-3.5 -top-8 z-50 bg-gray-500 px-2 py-0.5 text-center 
          text-white font-black transition-opacity duration-300 rounded shadow-md
          opacity-0 group-hover:opacity-95"
    >
      {children}
      <div
        className="absolute w-0 h-0 border-8 border-r-8 border-b-8 border-transparent 
          border-b-gray-500 rotate-180 right-4"
      />
    </div>
  );
}
