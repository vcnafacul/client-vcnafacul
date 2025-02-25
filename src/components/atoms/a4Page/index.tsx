import { ReactNode } from "react";

export function A4Page({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-auto m-2 shadow-lg">
      <div
        className="w-[794px] h-[1123px] bg-white border shadow-lg p-4 flex flex-wrap gap-4"
        style={{ boxShadow: "0px 0px 10px rgba(0,0,0,0.2)" }}
      >
        {children}
      </div>
    </div>
  );
}
