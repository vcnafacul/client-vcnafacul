import { VariantProps, tv } from "tailwind-variants";

const questionBox = tv({
    base: 'w-8 h-8 rounded m-1 cursor-pointer flex justify-center items-center pb-1 text-base border',
    variants: {
        status: {
            unsolved : 'bg-lightYellow border-marine',
            solved : 'bg-white border-marine',
            active : 'bg-orange border-orange text-white font-black',
            unread : 'bg-lightGray border-grey opacity-50',
        }
    },
    defaultVariants: {
        status: 'unsolved'
    }
})

export type QuestionBoxProps = React.ComponentProps<"div"> & VariantProps<typeof questionBox> & {
    number: number;
}

function QuestionBox({ number, status, ...props }: QuestionBoxProps) {
    return (
        <div className={questionBox({ status })} {...props}>
            {number}
        </div>
    ) 
}

export default QuestionBox