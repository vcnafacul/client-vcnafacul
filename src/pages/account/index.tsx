/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountForm } from "@/components/organisms/accountForm";
import { useToastAsync } from "@/hooks/useToastAsync";
import { UserMe } from "@/types/user/userMe";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ReactComponent as LogoIcon } from "../../assets/images/home/logo.svg";
import ImageProfile from "../../components/molecules/imageProfile";
import ModalConfirmCancel from "../../components/organisms/modalConfirmCancel";
import { changeImageProfileCollaborator } from "../../services/auth/changeImageProfileCollaborator";
import { me } from "../../services/auth/me";
import { removeImageProfileCollaborator } from "../../services/auth/removeImageProfileCollaborator";
import { updateUser } from "../../services/auth/updateUser";
import { AuthUpdate, Gender, useAuthStore } from "../../store/auth";
import { useModals } from "@/hooks/useModal";

function Account() {
  const {
    data: { token },
    updateAccount,
  } = useAuthStore();
  const executeAsync = useToastAsync();


  const modals = useModals([
    'deleteImage',
  ]);

  const [userAccount, setUserAccount] = useState<UserMe>();

  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [file, setFile] = useState<any>(null);

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
    const formData = new FormData();
    formData.append("file", file!);

    await executeAsync({
      action: () => changeImageProfileCollaborator(formData, token),
      loadingMessage: "Upload de Imagem de Perfil Colaborador ... ",
      successMessage: "Upload feito com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: (fileName) => {
        setUserAccount({ ...userAccount!, collaboratorPhoto: fileName });
        updateAccount({ ...userAccount! });
      },
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
    modals.deleteImage.close();
  };

  const updateData = async (
    authUpdate: AuthUpdate,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    await executeAsync({
      action: () => updateUser(token, authUpdate),
      loadingMessage: "Atualizando Informações Usuário ... ",
      successMessage: "Atualização feita com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        updateAccount({ ...userAccount!, ...authUpdate });
        setUserAccount({ ...userAccount!, ...authUpdate });
        onSuccess?.();
      },
      onError: () => {
        onError?.();
      },
    });
  };

  const update = (data: any, onSuccess?: () => void, onError?: () => void) => {
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
      useSocialName: data.useSocialName,
    };
    if (file) {
      uploadingImagem(file).then(() => {
        updateData(authUpdate, onSuccess, onError);
      });
    } else {
      updateData(authUpdate, onSuccess, onError);
    }
  };

  const ModalDelete = () => {
    return (
      <ModalConfirmCancel
        isOpen={modals.deleteImage.isOpen}
        handleClose={modals.deleteImage.close}
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
      <div className="pb-20 flex flex-col md:flex-row w-full">
        {/* Cabeçalho com imagem e nome do usuário */}
        <div className="flex px-6 py-4 w-full md:w-[300px] rounded-bl-3xl shadow-sm">
          {/* Avatar or Logo */}
          <div className="flex flex-row md:flex-col gap-4">
            {userAccount?.collaborator ? (
              <ImageProfile
                deleteImage={modals.deleteImage.open}
                onChange={handleImageChange}
                src={imagePreview}
              />
            ) : (
              <LogoIcon className="w-24 h-24 p-2 bg-white border rounded-full animate-rotate" />
            )}
          </div>
          <div className="flex flex-col px-8 pt-4 md:hidden justify-center">
            <span className="text-marine text-2xl md:text-4xl font-extrabold leading-tight">
              {userAccount?.useSocialName
                ? userAccount?.socialName
                : userAccount?.firstName}
            </span>
            <span className="text-marine text-lg md:text-xl font-medium">
              {userAccount?.lastName}
            </span>
            {userAccount?.collaborator && (
              <span className="text-marine text-sm font-semibold mt-1 opacity-80">
                {userAccount?.collaboratorDescription}
              </span>
            )}
          </div>
        </div>
        <div className="w-full">
          {/* Name and Role */}
          <div className="md:flex flex-col px-8 pt-4 hidden">
            <span className="text-marine text-2xl md:text-4xl font-extrabold leading-tight">
              {userAccount?.useSocialName
                ? userAccount?.socialName
                : userAccount?.firstName}
            </span>
            <span className="text-marine text-lg md:text-xl font-medium">
              {userAccount?.lastName}
            </span>
            {userAccount?.collaborator && (
              <span className="text-marine text-sm font-semibold mt-1 opacity-80">
                {userAccount?.collaboratorDescription}
              </span>
            )}
          </div>

          {/* Formulário de atualização */}
          <div className="px-6 py-6 w-full">
            {userAccount && (
              <AccountForm update={update} userAccount={userAccount} />
            )}
          </div>
        </div>
      </div>
      <ModalDelete />
    </>
  );
}

export default Account;
