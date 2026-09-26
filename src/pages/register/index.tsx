import EntrarComGoogle from "@/components/molecules/entrarComGoogle";
import { registerUser } from "@/services/auth/registerUser";
import {
  buscarConvitePorToken,
  cadastrarPeloConvite,
  type ConvitePorToken,
} from "@/services/prepCourse/conviteColaborador";
import { CONVITE_COLABORADOR, DASH } from "@/routes/path";
import { useAuthStore } from "@/store/auth";
import { decoderUser } from "@/utils/decodedUser";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import RegisterForm from "../../components/organisms/registerForm";
import BaseTemplate from "../../components/templates/baseTemplate";
import { registerForm } from "./data";
import { UserRegister } from "@/types/user/userRegister";
import { toast } from "react-toastify";

function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doAuth } = useAuthStore();
  /*
    ⚠️ **Cadastro pelo convite** (card 05 de `convite-de-colaborador`):
    `/cadastro?convite=<token>`, vindo da página do link. A conta nasce já
    colaboradora, com a função, e logada.
  */
  const tokenDoConvite = new URLSearchParams(location.search).get("convite");
  const [convite, setConvite] = useState<ConvitePorToken | null>(null);
  const [avisoDoConvite, setAvisoDoConvite] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenDoConvite) return;
    buscarConvitePorToken(tokenDoConvite)
      .then((c) => {
        // Quem já tem conta aceita pela página do link, com login.
        if (c.temConta) {
          navigate(`/${CONVITE_COLABORADOR}?token=${encodeURIComponent(tokenDoConvite)}`);
          return;
        }
        if (c.situacao !== "pendente") {
          setAvisoDoConvite(
            "Este convite não vale mais — você pode se cadastrar normalmente, e pedir um novo convite ao cursinho.",
          );
          return;
        }
        setConvite(c);
      })
      .catch(() =>
        setAvisoDoConvite(
          "Não encontramos este convite — você pode se cadastrar normalmente.",
        ),
      );
  }, [tokenDoConvite, navigate]);

  const onRegister = async (data: UserRegister) => {
    if (convite && tokenDoConvite) {
      return cadastrarPeloConvite(tokenDoConvite, data)
        .then(({ access_token }) => {
          doAuth(decoderUser(access_token));
          toast.success(
            `Conta criada! Você agora faz parte do ${convite.nomeCursinho} como ${convite.funcao}.`,
          );
          navigate(DASH);
        })
        .catch((error: Error) => {
          toast.error(error.message);
          throw error;
        });
    }
    return registerUser(data)
      .then(() => {
        toast.success("Cadastro realizado com sucesso");
      })
      .catch((error: Error) => {
        toast.error(error.message);
        throw error;
      });
  };

  return (
    <BaseTemplate
      solid
      className="bg-white overflow-y-auto scrollbar-hide h-screen"
    >
      <div className="relative py-4">
        <TriangleGreen className="graphism triangle-green" />
        <TriangleYellow className="graphism triangle-yellow" />
        {convite && (
          <p data-convite className="mx-auto mt-6 max-w-[500px] px-4 text-center">
            Você foi convidado para o <strong>{convite.nomeCursinho}</strong> como{" "}
            <strong>{convite.funcao}</strong>. Ao concluir o cadastro, você já entra
            como colaborador.
          </p>
        )}
        {avisoDoConvite && (
          <p data-aviso-convite className="mx-auto mt-6 max-w-[500px] px-4 text-center text-red-700">
            {avisoDoConvite}
          </p>
        )}
        {/*
          ⚠️ `key` pelo email: o formulário só pode montar DEPOIS de o convite
          chegar, senão o passo 1 não recebe o email travado.
        */}
        {(!tokenDoConvite || convite || avisoDoConvite) && (
          <RegisterForm
            key={convite?.email ?? "sem-convite"}
            title={registerForm.title}
            titleSuccess={registerForm.titleSuccess}
            onRegister={onRegister}
            emailTravado={convite?.email}
          />
        )}
        {(!tokenDoConvite || avisoDoConvite) && (
          <EntrarComGoogle label="Cadastrar com Google" />
        )}
        {/*
          ⚠️ Convite pelo Google (card 05 de `login-com-google`): se a conta
          Google já existir, a api faz login e volta à página do convite, que
          aceita ali; se não, o 2º passo cria a conta já colaboradora.
        */}
        {convite && tokenDoConvite && (
          <EntrarComGoogle
            label="Cadastrar com Google"
            convite={tokenDoConvite}
            voltar={`/${CONVITE_COLABORADOR}?token=${encodeURIComponent(tokenDoConvite)}`}
          />
        )}
      </div>
    </BaseTemplate>
  );
}

export default Register;
