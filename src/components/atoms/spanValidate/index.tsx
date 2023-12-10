interface SpanValidateProps {
    children: React.ReactNode;
    valid: boolean;
}

function SpanValidate({ children, valid } : SpanValidateProps){ 
    return(
        <div className={`font-black ${valid ? 'text-green' : 'text-grey'}`}>
            {children}
        </div>
    )
}

export default SpanValidate