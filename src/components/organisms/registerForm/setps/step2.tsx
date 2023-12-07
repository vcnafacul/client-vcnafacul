import { StepProps } from ".."
import FormField from "../../../molecules/formField"
import Button from "../../../molecules/button";
import { useEffect } from "react";

interface Step2Props extends StepProps {
    labelSubmit: string;
}

const LGPD = 'lgpd';

function Step2({ formData, register, watch, labelSubmit } : Step2Props){
    const checked = watch(LGPD)

    useEffect(() => {
        const subscription = watch(() => {})
        return () => subscription.unsubscribe()
    }, [watch])
    
    return (
        <>
            {formData.map(fData => (
                <FormField register={register} id={fData.id} options={fData.options} key={fData.id} label={fData.label} type={fData.type} visibility={fData.visibility} />
            ))}
            <div className="flex w-full gap-2 justify-center">
                <input type="checkbox" {...register(LGPD)} />
                <span>Eu li e aceito os{" "} 
                    <a className="font-black text-grey" onClick={(e) => e.stopPropagation()} href="/Termos%20de%20Uso.pdf" target="_blank">
                            termos de uso
                    </a>
                    {" "}e{" "}   
                    <a
                        className="font-black text-grey"
                        onClick={(e) => e.stopPropagation()}
                        href="/Pol%C3%ADtica%20de%20Privacidade.pdf"
                        target="_blank" >
                            políticas de privacidade
                    </a></span>
            </div>
            <Button disabled={!checked} type={checked ? 'submit' : 'button'}>{labelSubmit}</Button>
        </>
    )
}

export default Step2