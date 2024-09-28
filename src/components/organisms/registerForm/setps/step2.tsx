import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { StepProps } from "..";
import { Gender } from "../../../../store/auth";
import { UserRegister } from "../../../../types/user/userRegister";
import Button from "../../../molecules/button";
import Form from "../../form";

interface UseRegisterStep2 {
  firstName: string;
  lastName: string;
  phone: string;
  birthday: string;
  city: string;
  lgpd: NonNullable<boolean>;
  state: string;
  gender: Gender;
}

interface Step2Props extends StepProps {
  dataUser: UserRegister;
  next: () => void;
  back: () => void;
  onRegister: (data: UserRegister) => Promise<void>;
}

function Step2({ formData, dataUser, next, back, onRegister }: Step2Props) {
  const schema = yup
    .object()
    .shape({
      firstName: yup.string().required("Por favor, informe seu nome"),
      lastName: yup.string().required("Por favor, informe seu sobrenome"),
      phone: yup.string().required("campo obrigatório"),
      gender: yup.number().required(),
      birthday: yup
        .string()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .required("campo obrigatório"),
      city: yup.string().required("campo obrigatório"),
      state: yup.string().required(),
      lgpd: yup
        .boolean()
        .oneOf([true], "Você deve aceitar os termos e políticas")
        .required("Por favor, confirmação necessária"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const registerSubmit = (data: UseRegisterStep2) => {
    onRegister({ ...dataUser, ...(data as UserRegister) }).then(() => {
      next();
    });
  };

  return (
    <form onSubmit={handleSubmit(registerSubmit)} className="w-full">
      <Form
        className="flex flex-col gap-4"
        register={register}
        formFields={formData}
        errors={errors}
      />
      <div className="flex w-full gap-2 justify-center my-2">
        <input type="checkbox" {...register("lgpd")} />
        <span>
          Eu li e aceito os{" "}
          <a
            className="font-black text-grey"
            onClick={(e) => e.stopPropagation()}
            href="/Termos%20de%20Uso.pdf"
            target="_blank"
          >
            termos de uso
          </a>{" "}
          e{" "}
          <a
            className="font-black text-grey"
            onClick={(e) => e.stopPropagation()}
            href="/Pol%C3%ADtica%20de%20Privacidade.pdf"
            target="_blank"
          >
            políticas de privacidade
          </a>
        </span>
      </div>
      <div className="text-red w-full text-center">
        {errors["lgpd"]?.message}
      </div>
      <div className="flex gap-4">
        <Button type="button" onClick={back}>
          Voltar
        </Button>
        <Button type="submit">Cadastrar</Button>
      </div>
    </form>
  );
}

export default Step2;
