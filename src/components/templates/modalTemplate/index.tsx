import React from "react"

export interface ModalProps {
    handleClose: () => void;
}

interface ModalTemplateProps{
    children: React.ReactNode;
}

function ModalTemplate({ children } : ModalTemplateProps) {
    return (
        <div className="fixed overflow-y-auto scrollbar-hide scrol w-screen h-screen top-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
            {children}
        </div>
    )
}

export default ModalTemplate