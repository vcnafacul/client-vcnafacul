interface SpanValidateProps {
    children: React.ReactNode;
    valid: boolean;
}

function SpanValidate({ children, valid } : SpanValidateProps){ 
    return(
        <div className={`font-extrabold ${valid ? 'text-success' : 'text-muted-foreground'}`}>
            {children}
        </div>
    )
}

export default SpanValidate