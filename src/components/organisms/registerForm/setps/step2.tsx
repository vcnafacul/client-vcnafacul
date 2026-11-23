import { DatePicker } from "@/components/ui/date-picker";
import { paraDataValida } from "@/lib/datasBr";
import { useToastAsync } from "@/hooks/useToastAsync";
import {
  linkSocialName,
  optionsGender,
  socialNameCheckbox,
  stateOptions,
} from "@/pages/register/data";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { StepProps } from "..";
import { Gender } from "../../../../store/auth";
import { UserRegister } from "../../../../types/user/userRegister";
import { Button } from "@/components/ui/button";
import { OptionsSelect } from "@/components/ui/options-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface UseRegisterStep2 {
  firstName: string;
  lastName: string;
  socialName?: string;
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
  /** Sem `back`, não há passo anterior — o cadastro pelo Google. */
  back?: () => void;
  onRegister: (data: UserRegister) => Promise<void>;
  /**
   * Nome e sobrenome sugeridos — o cadastro pelo Google (card 03 de
   * `login-com-google`) já os recebe do Google, e a pessoa pode trocar.
   */
  valoresIniciais?: { firstName?: string; lastName?: string };
}

function Step2({
  dataUser,
  next,
  back,
  onRegister,
  valoresIniciais,
}: Step2Props) {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const executeAsync = useToastAsync();

  const schema = yup
    .object()
    .shape({
      firstName: yup.string().required("Por favor, informe seu nome"),
      lastName: yup.string().required("Por favor, informe seu sobrenome"),
      socialName: yup.string(),
      phone: yup.string().required("campo obrigatório"),
      gender: yup.number().required(),
      birthday: yup
        .string()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .required("Campo obrigatório")
        .test("age", "Você deve ter no mínimo 14 anos", (value) => {
          if (!value) return false;
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          if (
            age > 14 ||
            (age === 14 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
          ) {
            return true;
          }
          return false;
        }),
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
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: valoresIniciais?.firstName ?? "",
      socialName: "",
      lastName: valoresIniciais?.lastName ?? "",
    },
  });

  const firstName = watch("firstName");
  const socialName = watch("socialName");
  const lastName = watch("lastName");

  const getDisplayName = () => {
    const nameToUse = isCheckboxChecked && socialName ? socialName : firstName;
    return `${nameToUse} ${lastName}`.trim();
  };

  const registerSubmit = async (data: UseRegisterStep2) => {
    if (!isCheckboxChecked) {
      data.socialName = "";
    }
    data.birthday = new Date(data.birthday).toISOString();

    await executeAsync({
      action: () => onRegister({ ...dataUser, ...(data as UserRegister) }),
      loadingMessage: "Cadastrando ... ",
      successMessage: "Cadastro realizado com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => next(),
    });
  };

  useEffect(() => {
    register("firstName");
    register("lastName");
    register("socialName");
    register("phone");
    register("gender");
    register("birthday");
    register("city");
    register("state");
    register("lgpd");
  }, [register]);

  return (
    <form
      onSubmit={handleSubmit(registerSubmit)}
      noValidate
      className="w-full flex flex-col gap-4"
    >
      <FormLegend />
      <Field label="Nome" required error={errors.firstName?.message}>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          defaultValue={valoresIniciais?.firstName}
          onChange={(e) => setValue("firstName", e.target.value)}
        />
      </Field>
      <div className="flex flex-col w-full items-start justify-start">
        <div>
          <Checkbox
            id="socialNameCheckbox"
            label="Desejo utilizar o Nome Social"
            checked={isCheckboxChecked}
            onCheckedChange={(marcado) => setIsCheckboxChecked(marcado === true)}
          />
        </div>
        <div className="text-body text-muted-foreground">
          <span className="text-body font-extrabold pb-2 text-muted-foreground"></span>
          {socialNameCheckbox}{" "}
          <a
            href={linkSocialName}
            target="_blank"
            className="text-primary underline hover:text-primary focus:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Saiba mais aqui.
          </a>
        </div>
      </div>
      <Field label="Nome Social" error={errors.socialName?.message}>
        <Input
          id="socialName"
          type="text"
          disabled={!isCheckboxChecked}
          onChange={(e) => setValue("socialName", e.target.value)}
        />
      </Field>
      <Field label="Sobrenome" required error={errors.lastName?.message}>
        <Input
          id="lastName"
          type="text"
          autoComplete="family-name"
          defaultValue={valoresIniciais?.lastName}
          onChange={(e) => setValue("lastName", e.target.value)}
        />
      </Field>
      <span className="text-caption text-muted-foreground font-semibold mb-4">
        Esta é uma pré-visualização do nome que será utilizado na plataforma:{" "}
        {getDisplayName()}
      </span>
      <Field label="Gênero" required error={errors.gender?.message}>
        <OptionsSelect
          id="gender"
          options={optionsGender}
          value={watch("gender")}
          onValueChange={(valor) => setValue("gender", valor)}
        />
      </Field>
      <Controller
        name="birthday"
        control={control}
        defaultValue={new Date() as unknown as string}
        render={({ field }) => (
          <Field label="Data de Nascimento" error={errors.birthday?.message}>
            <DatePicker
              value={paraDataValida(field.value)}
              // o formulário guarda a Date, como o calendário do PrimeReact fazia
                onChange={(d) => d && field.onChange(d as unknown as string)}
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date()}
            />
          </Field>
        )}
      />
      <Field label="Telefone" required error={errors.phone?.message}>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          onChange={(e) => setValue("phone", e.target.value)}
        />
      </Field>
      <Field label="Cidade" required error={errors.city?.message}>
        <Input
          id="city"
          type="text"
          autoComplete="address-level2"
          onChange={(e) => setValue("city", e.target.value)}
        />
      </Field>
      <Field label="Estado" required error={errors.state?.message}>
        <OptionsSelect
          id="state"
          options={stateOptions}
          value={watch("state")}
          onValueChange={(valor) => setValue("state", valor)}
        />
      </Field>
      <div className="flex w-full gap-2 justify-center my-2">
        <input type="checkbox" {...register("lgpd")} />
        <span>
          Eu li e aceito os{" "}
          <a
            className="font-extrabold text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
            href="/docs/Termos%20de%20Uso.pdf"
            target="_blank"
          >
            termos de uso
          </a>{" "}
          e{" "}
          <a
            className="font-extrabold text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
            href="/docs/Pol%C3%ADtica%20de%20Privacidade.pdf"
            target="_blank"
          >
            políticas de privacidade
          </a>
        </span>
      </div>
      <div className="text-destructive w-full text-center">
        {errors["lgpd"]?.message}
      </div>
      <div className="flex gap-4">
        {back && (
          <Button className="w-full" variant="primary" size="lg" type="button" onClick={back}>
            Voltar
          </Button>
        )}
        <Button className="w-full" variant="cta" size="lg" type="submit">Cadastrar</Button>
      </div>
    </form>
  );
}

export default Step2;
