import ModalTemplate from "@/components/templates/modalTemplate";
import { Button } from "@/components/ui/button";
import { useToastAsync } from "@/hooks/useToastAsync";
import { InviteMember } from "@/services/prepCourse/invite-member";
import { useAuthStore } from "@/store/auth";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

interface TempInviteMemberProps {
  isOpen: boolean;
  handleClose: () => void;
}

export function TempInviteMember(props: TempInviteMemberProps) {
  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Insira um email valido")
      .required("Por favor, preencha o email"),
  });

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function onSubmit(data: { email: string }) {
    await executeAsync({
      action: () => InviteMember(data.email, token),
      loadingMessage: "Enviando convite...",
      successMessage: "Convite enviado com sucesso!",
      errorMessage: (error: Error) => error.message,
      onError: (error: Error) => {
        if (error.message === "Failed to fetch") {
          return "Erro ao enviar convite, tente novamente mais tarde";
        }
        return error.message;
      },
      onSuccess: () => {
        props.handleClose();
      },
    });
  }

  return (
    <ModalTemplate {...props} className="bg-white p-4 rounded-md">
      <div className="w-96">
        <h2 className="text-base text-center font-bold text-marine">
          Digite o e-mail do usuário para convidá-lo como colaborador do
          cursinho.
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Email"
            id="email"
            className="w-full mt-4 p-2 border border-gray-300 rounded focus:outline-marine/20"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-redError text-end">
              {errors.email.message}
            </span>
          )}
          <Button
            className="w-full mt-4 bg-orange hover:bg-orange/70"
            type="submit"
          >
            Convidar
          </Button>
        </form>
      </div>
    </ModalTemplate>
  );
}
