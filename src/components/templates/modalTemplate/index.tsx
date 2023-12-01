import React from "react"

interface ModalTemplateProps{
    children: React.ReactNode;
}

function ModalTemplate({ children } : ModalTemplateProps) {
    return (
        <div className="absolute w-screen h-screen top-0 z-50 opacity-75 bg-black flex justify-center items-center">
            {children}
        </div>
    )
}

export default ModalTemplate