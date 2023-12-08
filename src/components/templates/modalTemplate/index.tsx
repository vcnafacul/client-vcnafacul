import React, { ComponentProps } from "react"

export interface ModalProps {
    handleClose: () => void;
}

interface ModalTemplateProps extends ComponentProps<'div'> {
    children: React.ReactNode;
}

function ModalTemplate({ children, ...props } : ModalTemplateProps) {
    return (
        <div className="fixed overflow-y-auto scrollbar-hide scrol w-screen h-screen top-0 left-0 z-50 bg-black bg-opacity-30 flex justify-center items-center" {...props}>
            {children}
        </div>
    )
}

export default ModalTemplate