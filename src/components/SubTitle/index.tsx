import React from "react"

interface SubTitleProps {
    children: React.ReactNode
}

function SubTitle({children}: SubTitleProps) {
    return (
        <h2 className="text-xl leading-7 mb-10 text-center md:leading-9 md:mb-24 md:text-left">{children}</h2>
    )
}

export default SubTitle