import { ComponentProps } from "react";
import { getColorFromName } from "../../../utils/getColorFromName";
import { VariantProps, tv } from "tailwind-variants";

const simpleCardColor = tv({
    base: 'bg-white flex transition-all duration-300 rounded-lg select-none',
    variants: {
        disable: {
            true: 'opacity-40 bg-gray-400',
            false: 'bg-opacity-100 cursor-pointer'
        }
    },
    defaultVariants: {
        disable: false
    }
})

const obterSigla = (str: string) => {
    const palavras = str.split(' ');
    const sigla = palavras.reduce((acumulador, palavra) => acumulador + palavra[0].toUpperCase(), '');
    return sigla;
}

export type SimpleCardColorProps = VariantProps<typeof simpleCardColor> & ComponentProps<'div'> & {
    selected?: boolean;
    name: string;
}

function SimpleCardColor({ selected, name, disable, ...props }: SimpleCardColorProps) {
    const selectedColor = getColorFromName(name);

    return (
        <div className={`${simpleCardColor({ disable })} ${selected ? `shadow-md shadow-gray-400` : 'shadow-gray-300 shadow'}`} 
            style={{ transform: `${ selected ? 'translateY(-2px) translateX(-2px)' : 'none' }`}} {...props}>
                <div className={`${!disable ? selectedColor : ''} text-white w-14 h-14 flex justify-center items-center font-black text-xl tracking-widest rounded-l-lg`}>{obterSigla(name)}</div>
                <div className={`${disable ? 'text-white' : 'text-black'} first-line:border-l h-14 px-4 font-semibold flex items-center justify-center text-xl`}>{name}</div>
        </div>
    )
}

export default SimpleCardColor;
