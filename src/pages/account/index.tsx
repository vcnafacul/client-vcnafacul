/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountForm } from "@/components/organisms/accountForm";
import { useModals } from "@/hooks/useModal";
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
import { getPhotoCollaborator } from "../../services/prepCourse/collaborator/get-photo";
import { AuthUpdate, Gender, useAuthStore } from "../../store/auth";

function Account() {
  const {
    data: { token },
    updateAccount,
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const modals = useModals(["deleteImage"]);

  const [userAccount, setUserAccount] = useState<UserMe>();

  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [file, setFile] = useState<any>(null);
  const [hasImageChange, setHasImageChange] = useState<boolean>(false);

  const loadCollaboratorPhoto = async (photoKey: string) => {
    try {
      // Limpar a URL do blob anterior se existir
      if (
        imagePreview &&
        typeof imagePreview === "string" &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }

      const blob = await getPhotoCollaborator(photoKey);
      const url = URL.createObjectURL(blob);
      setImagePreview(url);
    } catch (error) {
      console.error("Erro ao carregar foto do colaborador:", error);
      // Fallback para a URL do FTP caso falhe
      setImagePreview(`${VITE_FTP_PROFILE}${photoKey}`);
    }
  };

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
      setHasImageChange(true);
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
      onSuccess: async (fileName) => {
        setUserAccount({ ...userAccount!, collaboratorPhoto: fileName });
        updateAccount({ ...userAccount! });
        // Carregar a nova foto usando getPhotoCollaborator
        await loadCollaboratorPhoto(fileName);
        setFile(null);
        setHasImageChange(false);
      },
    });
  };

  const deleteImage = () => {
    // Limpar a URL do blob antes de deletar
    if (
      imagePreview &&
      typeof imagePreview === "string" &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    if (userAccount?.collaboratorPhoto) {
      removeImageProfileCollaborator(token)
        .then((res) => {
          if (res) {
            updateAccount({ ...userAccount! });
            setImagePreview(null);
            setFile(null);
            setHasImageChange(false);
          } else {
            toast.error("Não foi possível remover sua imagem");
          }
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    } else {
      setImagePreview(null);
      setFile(null);
      setHasImageChange(false);
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

    // Verificar se houve mudanças no formulário
    const hasFormChanges =
      authUpdate.firstName !== userAccount?.firstName ||
      authUpdate.lastName !== userAccount?.lastName ||
      authUpdate.socialName !== userAccount?.socialName ||
      new Date(authUpdate.birthday).toISOString() !== userAccount?.birthday ||
      authUpdate.city !== userAccount?.city ||
      authUpdate.state !== userAccount?.state ||
      authUpdate.phone !== userAccount?.phone ||
      authUpdate.gender !== userAccount?.gender ||
      authUpdate.about !== userAccount?.about ||
      authUpdate.useSocialName !== userAccount?.useSocialName;

    if (file) {
      uploadingImagem(file).then(() => {
        if (hasFormChanges) {
          updateData(authUpdate, onSuccess, onError);
        } else {
          onSuccess?.();
        }
      });
    } else if (hasFormChanges) {
      updateData(authUpdate, onSuccess, onError);
    } else {
      onSuccess?.();
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
      .then(async (res) => {
        setUserAccount(res);
        if (res?.collaboratorPhoto) {
          await loadCollaboratorPhoto(res.collaboratorPhoto);
        }
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });

    // Cleanup da URL do blob quando o componente é desmontado
    return () => {
      if (
        imagePreview &&
        typeof imagePreview === "string" &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };
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
              <AccountForm
                update={update}
                userAccount={userAccount}
                hasImageChange={hasImageChange}
              />
            )}
          </div>
        </div>
      </div>
      <ModalDelete />
    </>
  );
}

export default Account;
