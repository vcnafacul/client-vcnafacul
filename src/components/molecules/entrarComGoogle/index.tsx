import GoogleAuthButton from "@/components/atoms/googleAuthButton";

interface Props {
  label: string;
  voltar?: string;
  convite?: string;
}

/** "ou" + o botão do Google, na largura dos formulários de login/cadastro. */
function EntrarComGoogle({ label, voltar, convite }: Props) {
  return (
    <div className="mx-auto my-6 flex w-full max-w-[500px] flex-col gap-4 px-4">
      <div className="flex items-center gap-4" aria-hidden="true">
        <hr className="flex-1 border-grey/30" />
        <span className="text-sm text-grey">ou</span>
        <hr className="flex-1 border-grey/30" />
      </div>
      <GoogleAuthButton label={label} voltar={voltar} convite={convite} />
    </div>
  );
}

export default EntrarComGoogle;
