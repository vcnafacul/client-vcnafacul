/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserMe } from "@/types/user/userMe";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { ReactComponent as LogoIcon } from "../../assets/images/home/logo.svg";
import Text from "../../components/atoms/text";
import Button from "../../components/molecules/button";
import { FormFieldInput } from "../../components/molecules/formField";
import ImageProfile from "../../components/molecules/imageProfile";
import Form from "../../components/organisms/form";
import ModalConfirmCancel from "../../components/organisms/modalConfirmCancel";
import { changeImageProfileCollaborator } from "../../services/auth/changeImageProfileCollaborator";
import { me } from "../../services/auth/me";
import { removeImageProfileCollaborator } from "../../services/auth/removeImageProfileCollaborator";
import { updateUser } from "../../services/auth/updateUser";
import { AuthUpdate, Gender, useAuthStore } from "../../store/auth";
import { optionsGender, stateOptions } from "../register/data";

function Account() {
  const {
    data: { token },
    updateAccount,
  } = useAuthStore();
  const [tryDelete, setTryDelete] = useState<boolean>(false);

  const [userAccount, setUserAccount] = useState<UserMe>();

  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [file, setFile] = useState<any>(null);
  const [sended, setSended] = useState<boolean>(false);

  const schema = yup
    .object()
    .shape({
      firstName: yup.string().required("Por favor, preencha seu nome"),
      lastName: yup.string().required("Por favor, preencha seu sobrenome"),
      socialName: yup.string(),
      birthday: yup
        .string()
        .required("Por favor, insira uma data de nascimento"),
      state: yup.string().required("Campo Obrigatório"),
      city: yup.string().required("Por favor, preencha sua cidade"),
      about: yup.string().required("Fale um pouco sobre você"),
    })
    .required();

  const listInfo: FormFieldInput[] = [
    {
      id: "firstName",
      type: "text",
      label: "Nome:",
      defaultValue: userAccount?.firstName,
    },
    {
      id: "lastName",
      type: "text",
      label: "Sobrenome:",
      defaultValue: userAccount?.lastName,
    },
    {
      id: "socialName",
      type: "text",
      label: "Nome Social:",
      defaultValue: userAccount?.socialName,
    },
    {
      id: "gender",
      type: "option",
      options: optionsGender,
      label: "Gênero:",
      defaultValue: userAccount?.gender,
    },
    {
      id: "birthday",
      type: "date",
      label: "Data de Nascimento:",
      defaultValue: userAccount?.birthday
        ? userAccount.birthday.split("T")[0]
        : "",
    },
    {
      id: "phone",
      type: "text",
      label: "Telefone:",
      defaultValue: userAccount?.phone,
    },
    {
      id: "state",
      type: "option",
      label: "Estado:",
      defaultValue: userAccount?.state,
      options: stateOptions,
    },
    {
      id: "city",
      type: "text",
      label: "Cidade:",
      defaultValue: userAccount?.city,
    },
    {
      id: "about",
      type: "textarea",
      label: "Sobre mim:",
      defaultValue: userAccount?.about,
      className: `col-span-1 ${
        userAccount?.collaborator
        ? "sm:col-span-2 md:col-span-3 lg:col-span-4"
        : "sm:col-span-2 md:col-span-4"
        }`,
    },
  ];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const previewImage = (file: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
  };

  const handleImageChange = (e: any) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file.size > 1024 * 1024) {
      toast.warn("O arquivo pode ter no máximo 1mb", { theme: "dark" });
    } else {
      previewImage(file);
      setFile(file);
    }
  };

  const uploadingImagem = async (file: any) => {
    const id = toast.loading("Upload de Imagem de Perfil Colaborador ... ");
    const formData = new FormData();
    formData.append("file", file!);
    await changeImageProfileCollaborator(formData, token)
      .then((fileName) => {
        toast.update(id, {
          render: `Upload feito com sucesso`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setUserAccount({ ...userAccount!, collaboratorPhoto: fileName });
        updateAccount({ ...userAccount! });
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

  const deleteImage = () => {
    if (userAccount?.collaboratorPhoto) {
      removeImageProfileCollaborator(token)
        .then((res) => {
          if (res) {
            updateAccount({ ...userAccount! });
          } else {
            toast.error("Não foi possível remover sua imagem");
          }
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    } else {
      setImagePreview(null);
    }
    setTryDelete(false);
  };

  const updateData = (authUpdate: AuthUpdate) => {
    const id = toast.loading("Atualizando Informações Usuário ... ");
    updateUser(token, authUpdate)
      .then(async (_) => {
        toast.update(id, {
          render: `Atualização feita com sucesso`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .finally(() => {
        setSended(false);
      });
  }

  const update = (data: any) => {
    setSended(true);
    const authUpdate: AuthUpdate = {
      firstName: data.firstName,
      lastName: data.lastName,
      socialName: data.socialName,
      birthday: data.birthday,
      city: data.city,
      state: data.state,
      phone: data.phone,
      gender: parseInt(data.gender) as Gender,
      about: data.about,
    };
    if (file) {
      uploadingImagem(file).then(() => {
        updateData(authUpdate);
      });
    } else {
      updateData(authUpdate);
    }
  };

  const ModalDelete = () => {
    return (
      <ModalConfirmCancel
        isOpen={tryDelete}
        handleClose={() => setTryDelete(false)}
        handleConfirm={deleteImage}
        text="Tem certeza que deseja deletar sua imagem?"
      />
    );
  };

  useEffect(() => {
    me(token)
      .then((res) => {
        setUserAccount(res);
        if (res?.collaboratorPhoto) {
          setImagePreview(`${VITE_FTP_PROFILE}${res.collaboratorPhoto}`);
        }
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [token]);

  return (
    <>
      <div className="pb-20 bg-zinc-100 flex flex-col">
        {/* Cabeçalho com imagem e nome do usuário */}
        <div className="bg-custom-gradient py-1 px-4 flex items-center rounded-bl-3xl">
          <LogoIcon className="bg-white w-28 h-28 z-0 animate-rotate rounded-full p-1 border border-green2" />
          <div className="flex flex-col items-end">
            <span className="text-white text-4xl font-black ml-4">
              {userAccount?.firstName}
            </span>
            <span className="text-white text-xl">{userAccount?.lastName}</span>
          </div>
        </div>

        {/* Seção de título */}
        <Text className="self-start mx-10 pt-4" size="secondary">
          Meus Dados
        </Text>

        {/* Exibição de colaborador */}
        {userAccount?.collaborator && (
          <div className="flex flex-col items-center">
            <span>{userAccount?.collaboratorDescription}</span>
            <ImageProfile
              deleteImage={() => setTryDelete(true)}
              onChange={handleImageChange}
              src={imagePreview}
            />
          </div>
        )}

        {/* Formulário de atualização */}
        {userAccount && (
          <div className="ml-4 sm:mr-4 grid grid-cols-1 md:grid-cols-3 pr-6 sm:pr-0">
            <form
              onSubmit={handleSubmit(update)}
              className="flex flex-col pb-10 w-full gap-4 md:col-span-3"
            >
              <Form
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${
                  userAccount?.collaborator ? "" : " md:grid-cols-3"
                  } gap-4`}
                formFields={listInfo}
                register={register}
                errors={errors}
              />
              <div className="self-end">
                <Button disabled={sended} type="submit" size="small">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <ModalDelete />
    </>
  );
}

export default Account;
