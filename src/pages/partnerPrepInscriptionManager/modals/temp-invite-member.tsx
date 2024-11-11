import ModalTemplate from "@/components/templates/modalTemplate";
import { Button } from "@/components/ui/button";
import { InviteMember } from "@/services/prepCourse/invite-member";
import { useAuthStore } from "@/store/auth";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
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

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function onSubmit(data: { email: string }) {
    const id = toast.loading("Enviando convite...");
    InviteMember(data.email, token)
      .then(() => {
        toast.update(id, {
          render: "Convite enviado com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        props.handleClose();
      })
      .catch((e) => {
        if (e.message === "Failed to fetch") {
          e.message = "Erro ao enviar convite, tente novamente mais tarde";
        }
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  }
  TempInviteMember;

  return (
    <ModalTemplate {...props}>
      <div className="w-96">
        <h2 className="text-base font-bold text-marine">
          Insira o email do usuário que deseja convidar como membro do seu
          cursinho
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
