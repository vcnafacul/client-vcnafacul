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

const BRASIL_API = import.meta.env.VITE_BRASIL_API_URL;

interface PartnerPrepInscriptionStep2Props extends EachStepProps {
  updateData?: (data: Partial<StudentInscriptionDTO>) => void;
}

export function PartnerPrepInscriptionStep2({
  description,
  updateData,
  currentData,
  handleBack,
}: PartnerPrepInscriptionStep2Props) {
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
  const [street, setStreet] = useState<string>(currentData?.street || "");
  const [neighborhood, setNeighborhood] = useState<string>(
    currentData?.neighborhood || ""
  );
  const [city, setCity] = useState<string>(currentData?.city || "");
  const [state, setState] = useState<string>(currentData?.state || "");

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
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getCepInfo = async (cep: string) => {
    const response = await fetch(`${BRASIL_API}/cep/v2/${cep}`);
    const data = await response.json();
    return data;
  };

  const setCEP = async (cep: string) => {
    setPostalCode(cep);
    if (cep.length === 9) {
      const cepInfo = await getCepInfo(cep);

      setValue("street", cepInfo.street);
      setStreet(cepInfo.street);
      setValue("neighborhood", cepInfo.neighborhood);
      setNeighborhood(cepInfo.neighborhood);
      setValue("state", cepInfo.state);
      setState(cepInfo.state);
      setValue("city", cepInfo.city);
      setCity(cepInfo.city);
    }
  };

  useEffect(() => {
    register("postalCode");
    register("street");
    register("number");
    register("complement");
    register("neighborhood");
    register("city");
    register("state");
  }, []);

  useEffect(() => {
    if(currentData) {
      setValue("postalCode", currentData.postalCode || "");
      setValue("street", currentData.street|| "");
      setValue("number", currentData.number || 0);
      setValue("complement", currentData.complement|| "");
      setValue("neighborhood", currentData.neighborhood|| "");
      setValue("city", currentData.city|| "");
      setValue("state", currentData.state|| "");
    }
  }, []);

  function handleForm(data: Partial<StudentInscriptionDTO>) {
    updateData!(data);
  }

  function handleBackForm() {
    if (handleBack) {
      handleBack({
        ...currentData,
        postalCode: getValues("postalCode"),
        street: getValues("street"),
        number: getValues("number"),
        complement: getValues("complement"),
        neighborhood: getValues("neighborhood"),
        city: getValues("city"),
        state: getValues("state"),
      });
    }
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
          setCEP(value);
          setValue("postalCode", value);
        }}
      />
      <InputFactory
        id="street"
        label="Rua*"
        type="text"
        error={errors.street}
        value={street}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          const value = e.target.value;
          setStreet(value);
          setValue("street", value);
        }}
        maxLength={100}
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
        maxLength={200}
      />
      <InputFactory
        id="neighborhood"
        label="Bairro*"
        type="text"
        error={errors.neighborhood}
        value={neighborhood}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          const value = e.target.value;
          setNeighborhood(value);
          setValue("neighborhood", value);
        }}
        maxLength={50}
      />
      <InputFactory
        id="state"
        label="Estado*"
        type="select"
        error={errors.state}
        value={state}
        defaultValue={state}
        options={stateOptions as { value: string; label: string }[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          const value = e.value;
          setState(value);
          setValue("state", value);
        }}
      />
      <InputFactory
        id="city"
        label="Cidade*"
        type="text"
        error={errors.city}
        value={city}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          const value = e.target.value;
          setCity(value);
          setValue("city", value);
        }}
        maxLength={50}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="button" onClick={handleBackForm}>
          Voltar
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
