import Text from "@/components/atoms/text";
// import Button from "@/components/molecules/button";
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import { StudentInscriptionDTO } from "@/dtos/student/studentInscriptionDTO";
import { stateOptions } from "@/pages/register/data";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { EachStepProps } from "..";

export function PartnerPrepInscriptionStep2({
  description,
  updateData,
  currentData,
  handleBack,
}: EachStepProps) {
  const applyCepMask = (value?: string) => {
    // Remove tudo que não for número
    value = value?.replace(/\D/g, "") || "";

    // Aplica a máscara 99999-999
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{0,3}).*/, "$1-$2");
    } else {
      value = value.replace(/^(\d{0,5})/, "$1");
    }

    return value;
  };

  const [postalCode, setPostalCode] = useState<string>(
    applyCepMask(currentData?.postalCode) || ""
  );

  const schema = yup
    .object()
    .shape({
      postalCode: yup
        .string()
        .default(postalCode)
        .required("Por favor, preencha o seu CEP")
        .min(9, "CEP inválido"),
      street: yup
        .string()
        .default(currentData?.street)
        .required("Por favor, preencha o nome da sua rua"),
      number: yup
        .number()
        .default(currentData?.number)
        .min(1, "Número inválido")
        .required("Por favor, preencha o número da sua casa"),
      complement: yup.string().default(currentData?.complement),
      neighborhood: yup
        .string()
        .default(currentData?.neighborhood)
        .required("Por favor, preencha o seu barrio"),
      city: yup
        .string()
        .default(currentData?.city)
        .required("Por favor, preencha o sua cidade"),
      state: yup
        .string()
        .default(currentData?.state)
        .required("Por favor, preencha a seu estado"),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    register("postalCode");
    register("street");
    register("number");
    register("complement");
    register("neighborhood");
    register("city");
    register("state");
  }, []);

  function handleForm(data: Partial<StudentInscriptionDTO>) {
    updateData!(data);
  }
  return (
    <form
      onSubmit={handleSubmit(handleForm)}
      className="w-full flex flex-col gap-4 md:gap-2 mt-8 mb-16"
    >
      <Text size="tertiary">{description}</Text>
      <InputFactory
        id="postalCode"
        label="CEP*"
        type="text"
        error={errors.postalCode}
        value={postalCode}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          const value = applyCepMask(e.target.value);
          setPostalCode(value);
          setValue("postalCode", value);
        }}
      />
      <InputFactory
        id="street"
        label="Rua*"
        type="text"
        error={errors.street}
        defaultValue={currentData?.street}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("street", e.target.value)}
      />
      <InputFactory
        id="number"
        label="Número"
        type="number"
        defaultValue={currentData?.number}
        error={errors.number}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) =>
          setValue("number", e.target.value ? parseInt(e.target.value) : 0)
        }
      />
      <InputFactory
        id="complement"
        label="Complemento"
        type="text"
        defaultValue={currentData?.complement}
        error={errors.complement}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("complement", e.target.value)}
      />
      <InputFactory
        id="neighborhood"
        label="Bairro*"
        type="text"
        error={errors.neighborhood}
        defaultValue={currentData?.neighborhood}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("neighborhood", e.target.value)}
      />
      <InputFactory
        id="city"
        label="Cidade*"
        type="text"
        error={errors.city}
        defaultValue={currentData?.city}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("city", e.target.value)}
      />
      <InputFactory
        id="state"
        label="Estado*"
        type="select"
        error={errors.state}
        defaultValue={currentData?.state}
        options={stateOptions as { value: string; label: string }[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("state", e.value)}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="button" onClick={handleBack}>
          Voltar
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
