import GoogleAuthButton from "@/components/atoms/googleAuthButton";
import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import Step2 from "@/components/organisms/registerForm/setps/step2";
import BaseTemplate from "@/components/templates/baseTemplate";
import { CONVITE_COLABORADOR, DASH } from "@/routes/path";
import {
  CadastroGooglePendente,
  DadosDoCadastroGoogle,
  ErroDoCadastroGoogle,
  buscarCadastroGoogle,
  concluirCadastroGoogle,
  concluirCadastroGooglePeloConvite,
} from "@/services/auth/google";
import {
  ConvitePorToken,
  buscarConvitePorToken,
} from "@/services/prepCourse/conviteColaborador";
import { useAuthStore } from "@/store/auth";
import { UserRegister } from "@/types/user/userRegister";
import { decoderUser } from "@/utils/decodedUser";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VENCEU = "O tempo para concluir o cadastro acabou.";

/**
 * Com o convite (card 05): `valido` cria a conta já colaboradora;
 * `emailDiferente` pede outra conta Google ou seguir sem o convite; `semConvite`
 * é o cadastro comum — com `aviso` quando o convite deixou de valer.
 */
type Modo =
  | { tipo: "semConvite"; aviso?: string }
  | { tipo: "valido"; convite: ConvitePorToken; token: string }
  | { tipo: "emailDiferente"; convite: ConvitePorToken; token: string };

const normalizar = (email: string) => email.trim().toLowerCase();

/**
 * 2º passo do cadastro pelo Google (cards 02, 03 e 05 de `login-com-google`):
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
  const [modo, setModo] = useState<Modo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarCadastroGoogle()
      .then(async (p) => {
        setPendente(p);
        setModo(await modoDoConvite(p));
      })
      .catch((e: ErroDoCadastroGoogle) =>
        setErro(e.status === 401 ? VENCEU : e.message),
      );
  }, []);

  const concluir = async (dados: UserRegister) => {
    const corpo: DadosDoCadastroGoogle = {
      firstName: dados.firstName,
      lastName: dados.lastName,
      socialName: dados.socialName || undefined,
      phone: dados.phone,
      gender: Number(dados.gender),
      birthday: String(dados.birthday),
      state: dados.state,
      city: dados.city,
      lgpd: Boolean(dados.lgpd),
    };
    try {
      if (modo?.tipo === "valido") {
        const { access_token } = await concluirCadastroGooglePeloConvite(corpo);
        doAuth(decoderUser(access_token));
        toast.success(
          `Você agora faz parte do ${modo.convite.nomeCursinho} como ${modo.convite.funcao}.`,
        );
        navigate(DASH, { replace: true });
        return;
      }
      const { access_token, voltar } = await concluirCadastroGoogle(corpo);
      doAuth(decoderUser(access_token));
      navigate(voltar || DASH, { replace: true });
    } catch (e) {
      const { status, message } = e as ErroDoCadastroGoogle;
      if (status === 401) setErro(VENCEU);
      /*
        ⚠️ O convite deixou de valer entre o convite e o envio (expirou,
        cancelado, reenviado): a conta NÃO foi criada. Os dados continuam no
        formulário, e o próximo envio segue sem o convite.
      */
      if (status === 400 && modo?.tipo === "valido") {
        setModo({
          tipo: "semConvite",
          aviso: `${message} Você pode concluir o cadastro sem o convite.`,
        });
      }
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
          {!erro && (!pendente || !modo) && (
            <p role="status" className="text-grey">
              Carregando…
            </p>
          )}
          {!erro && pendente && modo?.tipo === "emailDiferente" && (
            <div data-email-diferente className="flex w-full flex-col gap-4 text-center">
              <p>
                O convite do <strong>{modo.convite.nomeCursinho}</strong> foi enviado
                para <strong>{modo.convite.email}</strong>, e você entrou com a conta
                Google <strong>{pendente.email}</strong>.
              </p>
              <GoogleAuthButton
                label="Entrar com outra conta Google"
                convite={modo.token}
                voltar={`/${CONVITE_COLABORADOR}?token=${encodeURIComponent(modo.token)}`}
              />
              <Button
                type="button"
                typeStyle="secondary"
                onClick={() => setModo({ tipo: "semConvite" })}
              >
                Criar conta sem o convite
              </Button>
            </div>
          )}
          {!erro && pendente && modo && modo.tipo !== "emailDiferente" && (
            <>
              {modo.tipo === "valido" && (
                <p data-convite className="text-center">
                  Você foi convidado para o <strong>{modo.convite.nomeCursinho}</strong>{" "}
                  como <strong>{modo.convite.funcao}</strong>. Ao concluir, você já
                  entra como colaborador.
                </p>
              )}
              {modo.tipo === "semConvite" && modo.aviso && (
                <p data-aviso-convite className="text-center text-red-700">
                  {modo.aviso}
                </p>
              )}
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

/**
 * ⚠️ O email é conferido ANTES do formulário — descobrir que o convite não
 * serve depois de preencher tudo seria pior. O servidor confere de novo.
 */
async function modoDoConvite(pendente: CadastroGooglePendente): Promise<Modo> {
  if (!pendente.convite) return { tipo: "semConvite" };
  try {
    const convite = await buscarConvitePorToken(pendente.convite);
    if (convite.situacao !== "pendente") {
      return {
        tipo: "semConvite",
        aviso: "Este convite não vale mais — você pode concluir o cadastro sem ele e pedir um novo convite ao cursinho.",
      };
    }
    return normalizar(convite.email) === normalizar(pendente.email)
      ? { tipo: "valido", convite, token: pendente.convite }
      : { tipo: "emailDiferente", convite, token: pendente.convite };
  } catch {
    return {
      tipo: "semConvite",
      aviso: "Não encontramos este convite — você pode concluir o cadastro sem ele.",
    };
  }
}

export default CadastroGoogle;
