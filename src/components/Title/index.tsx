import React from "react"

interface TitleProps {
    children: React.ReactNode
}

function Title({children}: TitleProps) {
    return (
        <h2 className="text-2xl font-bold leading-9 text-marine 
        mb-4 text-center md:text-4xl md:leading-6 md:mt-3 md:text-left">{children}</h2>
    )
}

export default Title