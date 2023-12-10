import { ComponentProps } from 'react';
import './styles.css'

type UlProps = ComponentProps<'ul'> & {
    childrens: React.ReactNode[];
}

function Ul({childrens, ...props}: UlProps){
    return (
        <ul {...props}>
            {childrens.map((children, index) => (
                <li key={index} className="item-marker ml-4 text-start text-base">{children}</li>
            ))}
        </ul>
    )
}

export default Ul