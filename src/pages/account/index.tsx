/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountForm } from "@/components/organisms/accountForm";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { UserMe } from "@/types/user/userMe";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as LogoIcon } from "../../assets/images/home/logo.svg";
import ImageProfile from "../../components/molecules/imageProfile";
import ModalConfirmCancel from "../../components/organisms/modalConfirmCancel";
import { changeImageProfileCollaborator } from "../../services/auth/changeImageProfileCollaborator";
import { me } from "../../services/auth/me";
import { removeImageProfileCollaborator } from "../../services/auth/removeImageProfileCollaborator";
import { updateUser } from "../../services/auth/updateUser";
import { getPhotoCollaborator } from "../../services/prepCourse/collaborator/get-photo";
import { updateCollaboratorFrentes } from "../../services/auth/updateCollaboratorFrentes";
import { AuthUpdate, Gender, useAuthStore } from "../../store/auth";
import { CollaboratorFrentesDisplay } from "./components/CollaboratorFrentesDisplay";
import { ModalEditFrentes } from "./components/ModalEditFrentes";
import { Button } from "@/components/ui/button";
import { NotificacoesDoAparelho } from "@/components/push/NotificacoesDoAparelho";
import { pushHabilitado } from "@/services/push/push";
import { MenuDoPerfil } from "./MenuDoPerfil";
import {
  ROTULO_DA_SECAO,
  secaoDaUrl,
  secoesDoPerfil,
  type SecaoDoPerfil,
} from "./secoes";

function Account() {
  const {
    data: { token },
    updateAccount,
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const modals = useModals(["deleteImage", "editFrentes"]);

  const [userAccount, setUserAccount] = useState<UserMe>();

  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [dadosSujos, setDadosSujos] = useState(false);
  const [params, setParams] = useSearchParams();

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
      // 2026-10-19: a foto salva na hora em que é escolhida (antes esperava o
      // "Salvar" do formulário). A pré-visualização aparece já.
      previewImage(file);
      void uploadingImagem(file);
    }
    e.target.value = "";
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
            setUserAccount({ ...userAccount!, collaboratorPhoto: "" });
            setImagePreview(null);
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

  const update = async (data: any, onSuccess?: () => void, onError?: () => void) => {
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

    try {
      // Atualizar dados do usuário (se houver mudanças) — a foto já salvou sozinha
      if (hasFormChanges) {
        await updateData(authUpdate, undefined, onError);
      }

      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };

  const handleSaveFrentes = async (frentesIds: string[]) => {
    await executeAsync({
      action: () => updateCollaboratorFrentes(frentesIds, token),
      loadingMessage: "Salvando frentes de afinidade...",
      successMessage: "Frentes salvas com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: async () => {
        const res = await me(token);
        setUserAccount(res);
      },
    });
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

  const ehColaborador = !!userAccount?.collaborator;
  const secoes = secoesDoPerfil(ehColaborador);
  const secao = secaoDaUrl(params.get("secao"), secoes);
  const escolher = (s: SecaoDoPerfil) => {
    const proximos = new URLSearchParams(params);
    if (s === "dados") proximos.delete("secao");
    else proximos.set("secao", s);
    setParams(proximos, { replace: true });
  };
  const nome = userAccount?.useSocialName
    ? userAccount?.socialName
    : userAccount?.firstName;

  /** Foto pequena, nome e função: sempre visíveis, em qualquer seção. */
  const identidade = (
    <div className="flex items-center gap-3">
      {ehColaborador && imagePreview ? (
        <img
          src={imagePreview}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
        />
      ) : ehColaborador ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-marine sm:h-12 sm:w-12">
          {nome?.charAt(0)}
        </span>
      ) : (
        <LogoIcon className="h-10 w-10 shrink-0 rounded-full border bg-white p-1 sm:h-12 sm:w-12" />
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold text-marine">
          {nome} {userAccount?.lastName}
        </p>
        {ehColaborador && userAccount?.collaboratorDescription && (
          <p className="truncate text-xs text-slate-500">
            {userAccount.collaboratorDescription}
          </p>
        )}
      </div>
    </div>
  );

  /*
    ⚠️ As seções ficam montadas e só se escondem: trocar de seção não perde o
    que foi digitado no formulário (o ponto no menu avisa que falta salvar).
  */
  const painel = (s: SecaoDoPerfil, conteudo: React.ReactNode) => (
    <section
      key={s}
      id={`secao-${s}`}
      role="tabpanel"
      aria-labelledby={`aba-${s}`}
      hidden={s !== secao}
      className="space-y-4"
    >
      <h1 className="text-xl font-bold text-marine">{ROTULO_DA_SECAO[s]}</h1>
      {conteudo}
    </section>
  );

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-20 pt-4 sm:flex-row sm:gap-10 sm:pt-8">
        <MenuDoPerfil
          secoes={secoes}
          atual={secao}
          onEscolher={escolher}
          identidade={identidade}
          dadosSujos={dadosSujos}
        />
        <div className="min-w-0 flex-1 sm:max-w-[720px]">
          {userAccount &&
            painel(
              "dados",
              <>
                {ehColaborador && (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:gap-6">
                    {/* shrink-0: na linha, o flex espremia a foto num oval */}
                    <div className="shrink-0">
                      <ImageProfile
                        deleteImage={modals.deleteImage.open}
                        onChange={handleImageChange}
                        src={imagePreview}
                      />
                    </div>
                    <div className="text-center text-sm text-slate-600 sm:text-left">
                      <p className="font-medium text-marine">Foto de perfil</p>
                      <p>
                        Aparece para o cursinho e na página pública. JPG ou PNG,
                        até 1 MB. Salva assim que você escolhe.
                      </p>
                    </div>
                  </div>
                )}
                <AccountForm
                  update={update}
                  userAccount={userAccount}
                  onChangesChange={setDadosSujos}
                />
              </>,
            )}
          {userAccount &&
            ehColaborador &&
            painel(
              "frentes",
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">
                    As frentes em que você pode ajudar o cursinho.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={modals.editFrentes.open}
                  >
                    Editar
                  </Button>
                </div>
                <CollaboratorFrentesDisplay
                  afinidades={userAccount.afinidades || []}
                  token={token}
                />
              </div>,
            )}
          {userAccount &&
            painel(
              "notificacoes",
              pushHabilitado() ? (
                <NotificacoesDoAparelho />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  As notificações no aparelho ainda não estão disponíveis neste
                  ambiente.
                </p>
              ),
            )}
        </div>
      </div>
      {ModalDelete()}
      {userAccount?.collaborator && (
        <ModalEditFrentes
          isOpen={modals.editFrentes.isOpen}
          onClose={modals.editFrentes.close}
          token={token}
          initialSelectedIds={userAccount.collaboratorFrentes || []}
          onSave={handleSaveFrentes}
        />
      )}
    </>
  );
}

export default Account;
