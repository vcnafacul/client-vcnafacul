import EntrarComGoogle from "@/components/molecules/entrarComGoogle";
import LoginForm from "@/components/organisms/loginForm";
import { useCaminhoAtual } from "@/hooks/useCaminhoAtual";
import BaseTemplate from "@/components/templates/baseTemplate";
import { Button } from "@/components/ui/button";
import { loginForm } from "@/pages/login/data";
import { DASH, REGISTER_PATH } from "@/routes/path";
import { refreshToken } from "@/services/auth/refresh";
import {
  aceitarConvite,
  buscarConvitePorToken,
  type ConvitePorToken,
} from "@/services/prepCourse/conviteColaborador";
import { useAuthStore } from "@/store/auth";
import { decoderUser } from "@/utils/decodedUser";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MENSAGEM_DA_SITUACAO } from "./textos";

/**
 * O link do convite de colaborador (card 04 de `convite-de-colaborador`).
 *
 * ⚠️ **Mostra antes de agir.** A página antiga (`convidar-membro`) aceitava
 * ao abrir, sem a pessoa decidir. Aqui ela vê o cursinho e a função, e só
 * então aceita.
 *
 * ⚠️ **Quem aceita é a conta logada** — o token do link não autentica. Sem
 * login, a página embute o formulário e continua aqui depois de entrar.
 */
export default function ConviteColaborador() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token") ?? "";
  // Entrar pelo Google volta para cá, com o mesmo token (card 04 de `login-com-google`)
  const voltarAqui = useCaminhoAtual();
  const {
    data: { token: tokenDeLogin, user },
    doAuth,
  } = useAuthStore();

  const [convite, setConvite] = useState<ConvitePorToken | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aceitando, setAceitando] = useState(false);
  const [aceito, setAceito] = useState(false);

  useEffect(() => {
    if (!token) {
      setErro("Link de convite inválido.");
      return;
    }
    buscarConvitePorToken(token)
      .then(setConvite)
      .catch((e: Error) => setErro(e.message));
  }, [token]);

  const aceitar = async () => {
    setAceitando(true);
    setErro(null);
    try {
      await aceitarConvite(token, tokenDeLogin);
      /*
        ⚠️ **As permissões novas vão no token de login** — sem renovar, a
        pessoa entra e não vê o menu de colaborador até relogar. O refresh
        monta o token com a função que o aceite acabou de gravar.
      */
      const renovado = await refreshToken();
      doAuth(decoderUser(renovado.access_token));
      setAceito(true);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setAceitando(false);
    }
  };

  return (
    <BaseTemplate solid>
      <div
        data-convite-colaborador
        className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center"
      >
        {conteudo()}
      </div>
    </BaseTemplate>
  );

  function conteudo() {
    if (aceito && convite) {
      return (
        <>
          <h1 className="text-2xl font-bold text-marine">Convite aceito!</h1>
          <p>
            Você agora faz parte do {convite.nomeCursinho} como{" "}
            <strong>{convite.funcao}</strong>.
          </p>
          <Button onClick={() => navigate(DASH)}>Ir para o painel</Button>
        </>
      );
    }
    if (!convite) {
      return erro ? (
        <p data-erro className="text-red-700">
          {erro}
        </p>
      ) : (
        <p className="text-gray-500">Carregando o convite…</p>
      );
    }

    const titulo = (
      <>
        <h1 className="text-2xl font-bold text-marine">
          Convite para o {convite.nomeCursinho}
        </h1>
        <p>
          Você foi convidado como <strong>{convite.funcao}</strong>.
        </p>
      </>
    );

    if (convite.situacao !== "pendente") {
      return (
        <>
          {titulo}
          <p data-situacao className="text-red-700">
            {MENSAGEM_DA_SITUACAO[convite.situacao]}
          </p>
        </>
      );
    }

    /*
      ⚠️ Sem conta: o convite leva ao cadastro (card 05), com o email do
      convite — é lá que a conta nasce já como colaboradora.
    */
    if (!tokenDeLogin && !convite.temConta) {
      return (
        <>
          {titulo}
          <p>
            Para aceitar, crie sua conta com o email <strong>{convite.email}</strong>.
          </p>
          <Button
            data-criar-conta
            onClick={() =>
              navigate(`${REGISTER_PATH}?convite=${encodeURIComponent(token)}`)
            }
          >
            Criar conta e aceitar
          </Button>
        </>
      );
    }

    if (!tokenDeLogin) {
      return (
        <>
          {titulo}
          <p>
            Entre com a conta de <strong>{convite.email}</strong> para aceitar.
          </p>
          {/* ⚠️ Continua nesta página depois de entrar — o store já tem o login. */}
          <LoginForm {...loginForm} onLogin={() => undefined} />
          <EntrarComGoogle label="Entrar com Google" voltar={voltarAqui} />
        </>
      );
    }

    /*
      ⚠️ Conta errada: o servidor recusa também — aqui só evita a pessoa
      descobrir pelo erro depois de clicar.
    */
    if (user.email?.toLowerCase() !== convite.email) {
      return (
        <>
          {titulo}
          <p data-conta-errada className="text-red-700">
            Este convite foi enviado para <strong>{convite.email}</strong>, e você
            está conectado como {user.email}. Saia e entre com a conta certa.
          </p>
        </>
      );
    }

    return (
      <>
        {titulo}
        <Button data-aceitar disabled={aceitando} onClick={aceitar}>
          {aceitando ? "Aceitando…" : "Aceitar convite"}
        </Button>
        {erro && (
          <p data-erro className="text-red-700">
            {erro}
          </p>
        )}
      </>
    );
  }
}
