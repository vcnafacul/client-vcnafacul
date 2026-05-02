/* eslint-disable @typescript-eslint/no-explicit-any */
import ControlCalendar from "@/components/atoms/controlCalendar";
import { optionsGender, stateOptions } from "@/pages/register/data.tsx";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { DASH } from "../../../routes/path";
import completeProfile from "../../../services/auth/completeProfile";
import { Gender, useAuthStore } from "../../../store/auth";
import Button from "../../molecules/button";
import { InputFactory } from "../inputFactory";

interface OnboardingFormData {
  phone: string;
  gender: Gender;
  birthday: string;
  city: string;
  state: string;
  lgpd: NonNullable<boolean>;
}

const schema = yup
  .object()
  .shape({
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

function OnboardingForm() {
  const { data, doAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (formData: OnboardingFormData) => {
    const id = toast.loading("Salvando dados ...");
    completeProfile(data.token, {
      ...formData,
      birthday: new Date(formData.birthday).toISOString(),
    })
      .then((authData) => {
        doAuth(authData);
        toast.update(id, {
          render: "Cadastro concluído!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        navigate(DASH);
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit as any)}
      className="w-full flex flex-col gap-4"
    >
      <InputFactory
        id="gender"
        label="Gênero"
        type="select"
        options={optionsGender}
        error={errors.gender}
        onChange={(e: any) => setValue("gender", e.target.value)}
      />
      <ControlCalendar control={control} label="Data de Nascimento" />
      <InputFactory
        id="phone"
        label="Telefone"
        type="text"
        error={errors.phone}
        onChange={(e: any) => setValue("phone", e.target.value)}
      />
      <InputFactory
        id="city"
        label="Cidade"
        type="text"
        error={errors.city}
        onChange={(e: any) => setValue("city", e.target.value)}
      />
      <InputFactory
        id="state"
        label="Estado"
        type="select"
        options={stateOptions}
        error={errors.state}
        onChange={(e: any) => setValue("state", e.target.value)}
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
      <Button type="submit">Continuar</Button>
    </form>
  );
}

export default OnboardingForm;
