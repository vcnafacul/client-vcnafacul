import { VariantProps, tv } from "tailwind-variants";

const questionBox = tv({
    base: 'w-8 h-8 rounded m-1 cursor-pointer flex justify-center items-center pb-1 text-base border relative',
    variants: {
        status: {
            unsolved : 'bg-lightYellow border-marine',
            solved : 'bg-white border-marine',
            active : 'bg-orange border-orange text-white font-black',
            unread : 'bg-lightGray border-grey opacity-50',
            isRight: 'bg-white border-marine'
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
            {status == 'isRight' ? <div className="absolute -right-2 -bottom-2 w-0 h-0 border-transparent border-t-green2 border-8 -rotate-45" /> : <></>}
        </div>
    ) 
}

export default QuestionBox