import GoogleAuthButton from "@/components/atoms/googleAuthButton";
import Text from "@/components/atoms/text";
import Step2 from "@/components/organisms/registerForm/setps/step2";
import BaseTemplate from "@/components/templates/baseTemplate";
import { DASH } from "@/routes/path";
import {
  CadastroGooglePendente,
  ErroDoCadastroGoogle,
  buscarCadastroGoogle,
  concluirCadastroGoogle,
} from "@/services/auth/google";
import { useAuthStore } from "@/store/auth";
import { UserRegister } from "@/types/user/userRegister";
import { decoderUser } from "@/utils/decodedUser";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VENCEU = "O tempo para concluir o cadastro acabou.";

/**
 * 2º passo do cadastro pelo Google (cards 02 e 03 de `login-com-google`):
 * `/cadastro/google`.
 *
 * ⚠️ A conta só nasce ao enviar este formulário (decisão de 2026-09-25). Até
 * lá, os dados do Google estão num cookie de 30 min na api — vencido, a pessoa
 * recomeça pelo botão.
 */
function CadastroGoogle() {
  const navigate = useNavigate();
  const { doAuth } = useAuthStore();
  const [pendente, setPendente] = useState<CadastroGooglePendente | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarCadastroGoogle()
      .then(setPendente)
      .catch((e: ErroDoCadastroGoogle) =>
        setErro(e.status === 401 ? VENCEU : e.message),
      );
  }, []);

  const concluir = async (dados: UserRegister) => {
    try {
      const { access_token, voltar } = await concluirCadastroGoogle({
        firstName: dados.firstName,
        lastName: dados.lastName,
        socialName: dados.socialName || undefined,
        phone: dados.phone,
        gender: Number(dados.gender),
        birthday: String(dados.birthday),
        state: dados.state,
        city: dados.city,
        lgpd: Boolean(dados.lgpd),
      });
      doAuth(decoderUser(access_token));
      navigate(voltar || DASH, { replace: true });
    } catch (e) {
      if ((e as ErroDoCadastroGoogle).status === 401) setErro(VENCEU);
      throw e;
    }
  };

  return (
    <BaseTemplate
      solid
      className="bg-white overflow-y-auto scrollbar-hide h-screen"
    >
      <div className="flex flex-col items-center w-full px-4 py-10">
        <div className="mt-10 max-w-[500px] flex flex-col items-center w-full gap-y-4">
          <Text size="secondary">Complete seu cadastro</Text>
          {erro && (
            <div data-erro className="flex w-full flex-col gap-4 text-center">
              <p className="text-red-700">{erro}</p>
              <GoogleAuthButton label="Entrar com Google de novo" />
            </div>
          )}
          {!erro && !pendente && (
            <p role="status" className="text-grey">
              Carregando…
            </p>
          )}
          {!erro && pendente && (
            <>
              <p data-email className="text-center">
                Conta Google: <strong>{pendente.email}</strong>
              </p>
              <Step2
                dataUser={{ email: pendente.email } as UserRegister}
                valoresIniciais={pendente}
                onRegister={concluir}
                next={() => {}}
              />
            </>
          )}
        </div>
      </div>
    </BaseTemplate>
  );
}

export default CadastroGoogle;
