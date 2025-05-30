import { getQuestionImage } from "@/services/question/getQuestionImage";
import { yupResolver } from "@hookform/resolvers/yup";
import heic2any from "heic2any";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdTrash } from "react-icons/io";
import { toast } from "react-toastify";
import * as yup from "yup";
import { ReactComponent as Preview } from "../../../assets/icons/Icon-preview.svg";
import Alternative from "../../../components/atoms/alternative";
import { Checkbox, CheckboxProps } from "../../../components/atoms/checkbox";
import { ImagePreview } from "../../../components/atoms/imagePreview";
import ModalImage from "../../../components/atoms/modalImage";
import Text from "../../../components/atoms/text";
import BLink from "../../../components/molecules/bLink";
import Button from "../../../components/molecules/button";
import {
  FormFieldInput,
  FormFieldOption,
} from "../../../components/molecules/formField";
import UploadButton from "../../../components/molecules/uploadButton";
import Form from "../../../components/organisms/form";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import ModalConfirmCancelMessage from "../../../components/organisms/modalConfirmCancelMessage";
import { ModalProps } from "../../../components/templates/modalTemplate";
import { Question } from "../../../dtos/question/questionDTO";
import {
  CreateQuestion,
  UpdateQuestion,
} from "../../../dtos/question/updateQuestion";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { Roles } from "../../../enums/roles/roles";
import { getMissingNumber } from "../../../services/prova/getMissingNumber";
import { createQuestion } from "../../../services/question/createQuestion";
import { deleteQuestion } from "../../../services/question/deleteQuestion";
import { uploadImage } from "../../../services/question/uploadImage";
import { useAuthStore } from "../../../store/auth";
import { BtnProps } from "../../../types/generic/btnProps";
import { Alternatives } from "../../../types/question/alternative";
import { InfoQuestion } from "../../../types/question/infoQuestion";
import { getStatusIcon } from "../../../utils/getStatusIcon";

interface ModalDetalhesProps extends ModalProps {
  question?: Question;
  infos: InfoQuestion;
  handleUpdateQuestionStatus: (status: StatusEnum, message?: string) => void;
  handleUpdateQuestion: (questionUpdate: UpdateQuestion) => void;
  handleAddQuestion: (question: Question) => void;
  handleRemoveQuestion: (id: string) => void;
}

function ModalDetalhes({
  question,
  infos,
  handleClose,
  handleUpdateQuestionStatus,
  handleUpdateQuestion,
  handleAddQuestion,
  handleRemoveQuestion,
}: ModalDetalhesProps) {
  const schema = yup
    .object()
    .shape({
      prova: yup
        .string()
        .required("Prova é obrigatoria")
        .typeError("Por favor, selecione uma prova")
        .default(question?.prova),
      numero: yup
        .number()
        .required("Número da questão é obrigatório")
        .typeError("Por favor, insira um número válido"),
      enemArea: yup
        .string()
        .required("Área do Conhecimento é obrigatorio")
        .typeError("Área do Conhecimento é obrigatorio")
        .default(question?.enemArea),
      materia: yup
        .string()
        .typeError("Materia é obrigatoria")
        .default(question?.materia),
      frente1: yup
        .string()
        .typeError("A Frente Principal é obrigatorio")
        .default(question?.frente1),
      frente2: yup.string().nullable().default(question?.frente2),
      frente3: yup.string().nullable().default(question?.frente3),
      textoQuestao: yup
        .string()
        .typeError("Texto da questão é obrigatorio")
        .default(question?.textoQuestao),
      pergunta: yup.string().default(question?.pergunta),
      textoAlternativaA: yup.string().default(question?.textoAlternativaA),
      textoAlternativaB: yup.string().default(question?.textoAlternativaA),
      textoAlternativaC: yup.string().default(question?.textoAlternativaA),
      textoAlternativaD: yup.string().default(question?.textoAlternativaA),
      textoAlternativaE: yup.string().default(question?.textoAlternativaA),
      alternativa: yup.string().required().default(question?.alternativa),
      imageId: yup.string().default(question?.imageId),
      provaClassification: yup.bool().default(question?.provaClassification),
      subjectClassification: yup
        .bool()
        .default(question?.subjectClassification),
      textClassification: yup.bool().default(question?.textClassification),
      imageClassfication: yup.bool().default(question?.imageClassfication),
      alternativeClassfication: yup
        .bool()
        .default(question?.alternativeClassfication),
      reported: yup.bool().default(question?.reported),
    })
    .required();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [photoOpen, setPhotoOpen] = useState<boolean>(false);
  const [refuse, setRefuse] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  const [comeBack, setComeback] = useState<boolean>(false);
  const [numberMissing, setNumberMissing] = useState<number[]>([]);
  const [tryDelete, setTryDelete] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [uploadFile, setUploadFile] = useState<Blob | null>(null);

  const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

  //WATCHERS
  const prova = watch("prova");
  const alternativa = watch("alternativa");
  const materia = watch("materia");
  const enemArea = watch("enemArea");
  const provaClassification = watch("provaClassification");
  const subjectClassification = watch("subjectClassification");
  const textClassification = watch("textClassification");
  const imageClassfication = watch("imageClassfication");
  const alternativeClassfication = watch("alternativeClassfication");
  const reported = watch("reported");
  //END WATCHERS

  const previewImage = (file: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file: Blob = e.target.files![0];
    previewImage(file);
    setUploadFile(file);
  };

  const {
    data: { permissao, token },
  } = useAuthStore();

  const resetAsyncForm = useCallback(async () => {
    reset(question); // asynchronously reset your form values
  }, [question, reset]);

  const provas: FormFieldOption[] = infos.provas.map((e) => ({
    label: e.nome,
    value: e._id,
  }));
  provas.unshift({ label: "", value: "" });

  const matetiasByEnemArea = infos.materias.filter((m) =>
    enemArea ? m.enemArea === enemArea : true
  );

  const materias: FormFieldOption[] = matetiasByEnemArea.map((m) => ({
    label: m.nome,
    value: m._id,
  }));
  materias.unshift({ label: "", value: undefined });

  const frentesBymateria = infos.frentes.filter((f) =>
    materia ? f.materia === materia : true
  );

  const mainFrente: FormFieldOption[] =
    frentesBymateria.map(
      (f) =>
        ({
          label: f.nome,
          value: f._id,
        } as FormFieldOption)
    ) || [];
  mainFrente.unshift({ label: "", value: undefined });

  const OptionalFrentes: FormFieldOption[] = infos.frentes.map((f) => ({
    label: f.nome,
    value: f._id,
  }));
  OptionalFrentes.unshift({ label: "", value: undefined });

  const numberOption: FormFieldOption[] = numberMissing.map((n) => ({
    label: `${n}`,
    value: n,
  }));

  const getEnemArea = (): FormFieldOption[] => {
    const enemArea = infos.provas.find((p) =>
      prova ? p._id === prova : question?.prova
    )?.enemAreas;
    if (enemArea) {
      return enemArea.map((e) => ({ label: e, value: e }));
    }
    return [];
  };

  const listFieldClassification: FormFieldInput[] = [
    {
      id: "prova",
      type: "option",
      label: "Prova:*",
      options: provas,
      value: question?.prova ?? "",
      disabled: !question ? false : !isEditing,
    },
    {
      id: "numero",
      type: "option",
      label: "Número da Questão:*",
      options: numberOption,
      disabled: !question ? false : !isEditing,
      value: question?.numero,
      defaultValue: question?.numero,
    },
    {
      id: "enemArea",
      type: "option",
      label: "Área do Conhecimento:*",
      options: getEnemArea(),
      value: question?.enemArea,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "materia",
      type: "option",
      label: "Disciplina:*",
      options: materias,
      value: question?.materia,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "frente1",
      type: "option",
      label: "Frente Principal:*",
      options: mainFrente,
      value: question?.frente1,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "frente2",
      type: "option",
      label: "Frente Secundária",
      options: OptionalFrentes,
      value: question?.frente2 ? question?.frente2 : "",
      disabled: !question ? false : !isEditing,
    },
    {
      id: "frente3",
      type: "option",
      label: "Frente Terciária",
      options: OptionalFrentes,
      value: question?.frente3 ? question?.frente3 : "",
      disabled: !question ? false : !isEditing,
    },
  ];

  const listFieldInfoQuestion: FormFieldInput[] = [
    {
      id: "textoQuestao",
      type: "textarea",
      label: "Texto da questão:*",
      value: question?.textoQuestao,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "pergunta",
      type: "text",
      label: "Pergunta:*",
      value: question?.pergunta,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "textoAlternativaA",
      type: "text",
      label: "Alternativa A:",
      value: question?.textoAlternativaA,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "textoAlternativaB",
      type: "text",
      label: "Alternativa B:",
      value: question?.textoAlternativaB,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "textoAlternativaC",
      type: "text",
      label: "Alternativa C:",
      value: question?.textoAlternativaC,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "textoAlternativaD",
      type: "text",
      label: "Alternativa D:",
      value: question?.textoAlternativaD,
      disabled: !question ? false : !isEditing,
    },
    {
      id: "textoAlternativaE",
      type: "text",
      label: "Alternativa E:",
      value: question?.textoAlternativaE,
      disabled: !question ? false : !isEditing,
    },
  ];

  const checkboxData: CheckboxProps[] = [
    {
      name: "provaClassification",
      title: "Classificação de Prova",
      checked: provaClassification,
      disabled: !question ? false : !isEditing,
    },
    {
      name: "subjectClassification",
      title: "Classificação de Disciplina e Frente",
      checked: subjectClassification,
      disabled: !question ? false : !isEditing,
    },
    {
      name: "textClassification",
      title: "Texto da Questão/alternativas",
      checked: textClassification,
      disabled: !question ? false : !isEditing,
    },
    {
      name: "imageClassfication",
      title: "Imagem",
      checked: imageClassfication,
      disabled: !question ? false : !isEditing,
    },
    {
      name: "alternativeClassfication",
      title: "Alternativa Correta",
      checked: alternativeClassfication,
      disabled: !question ? false : !isEditing,
    },
    {
      name: "reported",
      title: "Report",
      checked: reported,
      disabled: !question ? false : !isEditing,
    },
  ];

  const QuestionImageModal = () => {
    return !photoOpen ? null : (
      <ModalImage
        isOpen={photoOpen}
        handleClose={() => setPhotoOpen(false)}
        image={`https://api.vcnafacul.com.br/images/${question?.imageId}.png`}
      />
    );
  };

  const handleUpdateClose = (data: UpdateQuestion) => {
    handleUpdateQuestion(data);
  };

  const handleSave = (data: CreateQuestion) => {
    const dataQuestion = data as UpdateQuestion;
    if (!dataQuestion.materia || !dataQuestion.frente1) {
      dataQuestion.subjectClassification = true;
    }
    if (!dataQuestion.textoQuestao) {
      dataQuestion.textClassification = true;
    }
    if (question) {
      dataQuestion._id = question._id;
      if (uploadFile) {
        const formData = new FormData();
        formData.append("file", uploadFile);
        uploadImage(formData, token)
          .then((res: string) => {
            dataQuestion.imageId = res;
            handleUpdateClose(dataQuestion);
          })
          .catch((error: Error) => {
            toast.error(error.message);
          });
      } else {
        handleUpdateClose(dataQuestion);
      }
    } else {
      const formData = new FormData();
      formData.append("file", uploadFile as Blob);
      uploadImage(formData, token)
        .then((res: string) => {
          data.imageId = res;
          createQuestion(data, token)
            .then((res: Question) => {
              handleAddQuestion(res);
              handleClose!();
              toast.success(`Cadastro realizado com sucesso. Id: ${res._id}`);
            })
            .catch((error: Error) => {
              toast.error(error.message);
            });
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  };

  const handleDelete = () => {
    deleteQuestion(question!._id, token)
      .then(() => {
        handleClose!();
        handleRemoveQuestion(question!._id);
        toast.success(`Questão ${question?._id} deletada com sucess`);
      })
      .catch((erro: Error) => {
        toast.error(`Erro ao deletar questão ${erro.message}`);
      });
  };

  const btns: BtnProps[] = [
    {
      children: "Aceitar",
      type: "button",
      onClick: () => {
        handleUpdateQuestionStatus(StatusEnum.Approved);
      },
      status: StatusEnum.Approved,
      typeStyle: "accepted",
      editing: false,
      disabled:
        !permissao[Roles.validarQuestao] ||
        question?.status === StatusEnum.Approved,
    },
    {
      children: "Rejeitar",
      type: "button",
      onClick: () => {
        setRefuse(true);
      },
      status: StatusEnum.Rejected,
      editing: false,
      typeStyle: "refused",
      disabled:
        !permissao[Roles.validarQuestao] ||
        question?.status === StatusEnum.Rejected,
    },
    {
      children: "Editar",
      type: "button",
      onClick: () => {
        setIsEditing(true);
      },
      editing: false,
      className: "col-span-2",
      disabled: !permissao[Roles.validarQuestao],
    },
    {
      children: "Fechar",
      type: "button",
      onClick: handleClose,
      editing: false,
      className: "col-span-2",
    },
    {
      children: "Salvar",
      type: "submit",
      editing: true,
      className: "col-span-2",
      disabled: !modified,
    },
    {
      children: "Voltar",
      type: "button",
      onClick: () => {
        modified ? setComeback(true) : setIsEditing(false);
      },
      editing: true,
      className: "col-span-2",
    },
  ];

  const Buttons = () => {
    if (question) {
      return btns.map((btn, index) => {
        if (isEditing === btn.editing) {
          return (
            <div key={index} className={`${btn.className} rounded`}>
              <Button
                disabled={btn.disabled}
                type={btn.type}
                onClick={btn.onClick}
                typeStyle={btn.typeStyle}
                hover
                className={`${btn.className} w-full border-none`}
              >
                {btn.children}
              </Button>
            </div>
          );
        }
      });
    }
    return (
      <div className="flex flex-col gap-1 col-span-2">
        <Button
          type="submit"
          disabled={imagePreview === null || !permissao[Roles.criarQuestao]}
        >
          Salvar
        </Button>
        <Button type="button" onClick={handleClose}>
          Fechar
        </Button>
      </div>
    );
  };

  const getMissing = useCallback(async () => {
    if (prova) {
      getMissingNumber(prova, token)
        .then((res) => {
          if (question?.numero && res.includes(question.numero)) {
            setNumberMissing(res);
            setValue("numero", question.numero);
          } else if (
            question?.numero &&
            !res.includes(question.numero) &&
            prova === question.prova
          ) {
            setNumberMissing([question.numero, ...res]);
            setValue("numero", question.numero);
          } else {
            setNumberMissing(res);
            setValue("numero", res[0]);
          }
        })
        .catch((erro: Error) => {
          toast.error(erro.message);
        });
    } else {
      if (question) setNumberMissing([question.numero]);
      else setNumberMissing([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prova, token]);

  const ModalRefused = () => {
    return (
      <ModalConfirmCancelMessage
        isOpen={refuse}
        handleClose={() => {
          setRefuse(false);
        }}
        text="Descreva o motivo da rejeição:"
        handleConfirm={(message?: string) => {
          setRefuse(false);
          handleUpdateQuestionStatus(StatusEnum.Rejected, message);
        }}
        className="bg-white p-2 rounded-md"
      />
    );
  };

  const ModalComeBack = () => {
    return (
      <ModalConfirmCancel
        isOpen={comeBack && modified}
        handleClose={() => {
          setComeback(false);
        }}
        text="Suas alterações ainda não foram salvas. Se você sair agora, perderá todas as alterações. Deseja continuar?"
        handleConfirm={() => {
          setComeback(false);
          resetAsyncForm();
          setModified(false);
          setIsEditing(false);
        }}
        className="bg-white p-2 rounded-md"
      />
    );
  };

  const ModalDeleteQuestion = () => {
    return (
      <ModalConfirmCancel
        isOpen={tryDelete}
        handleClose={() => {
          setTryDelete(false);
        }}
        text="Ao confirmar a ação, a questão será excluida e não haverá volta. Deseja continuar?"
        handleConfirm={() => {
          handleDelete();
        }}
        className="bg-white p-2 rounded-md"
      />
    );
  };

  useEffect(() => {
    if (!prova && question?.prova) {
      setValue("prova", question.prova);
    }
    setValue(
      "enemArea",
      (getEnemArea().find((q) => q.label === question?.enemArea)
        ?.value as string) ?? undefined
    );
    if (question) {
      setValue("materia", question.materia);
      setValue("frente1", question.frente1);
      setValue("frente2", question.frente2);
      setValue("frente3", question.frente3);
      setValue("textoQuestao", question.textoQuestao);
      setValue("textoAlternativaA", question.textoAlternativaA);
      setValue("textoAlternativaB", question.textoAlternativaB);
      setValue("textoAlternativaC", question.textoAlternativaC);
      setValue("textoAlternativaD", question.textoAlternativaD);
      setValue("textoAlternativaE", question.textoAlternativaE);
      setValue("alternativa", question.alternativa);
      setValue("provaClassification", question.provaClassification);
      setValue("subjectClassification", question.subjectClassification);
      setValue("textClassification", question.textClassification);
      setValue("imageClassfication", question.imageClassfication);
      setValue("alternativeClassfication", question.alternativeClassfication);
      setValue("reported", question.reported);
    }
    getMissing();
    if (!modified) reset(question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infos.provas, prova]);

  useEffect(() => {
    if (modified) {
      setValue("materia", materias[0].value as string);

      const frente = infos.frentes.find(
        (f) => f.materia === (materias[0].value as string)
      );
      setValue("frente1", frente?._id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemArea]);

  useEffect(() => {
    const fetchImage = async () => {
      if (question?.imageId) {
        const id = toast.loading("Carregando imagem ...");
        try {
          const blob = await getQuestionImage(question.imageId, token);
          const fileType = blob.type; // Tipo MIME do arquivo

          if (fileType === "image/heic" || fileType === "image/heif") {
            // Se for HEIC, converte para PNG
            const convertedBlob = await heic2any({
              blob,
              toType: "image/png",
            });
            const convertedUrl = URL.createObjectURL(convertedBlob as Blob);
            setImageSrc(convertedUrl);
          } else {
            // Se não for HEIC, usa a imagem normal
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
          }
          toast.dismiss(id);
        } catch (error) {
          toast.update(id, {
            render: "Erro ao baixar documento",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      }
    };
    fetchImage();
  }, []);

  const BDownloadProva = () => {
    if (!prova) return null;
    return (
      <BLink
        to={`${VITE_BASE_FTP}${
          infos.provas.find((p) => p._id === prova)?.filename
        }`}
        target="_blank"
        className="flex"
        type="quaternary"
      >
        Visualizar Prova
      </BLink>
    );
  };

  useEffect(() => {
    const subscription = watch(() => {
      setModified(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="h-full flex justify-center items-center">
      <form
        onSubmit={handleSubmit(handleSave)}
        className="grid grid-cols-1 md:grid-cols-7 gap-x-4"
      >
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <Text
            className="flex w-full justify-center items-center"
            size="tertiary"
          >
            {!question ? <></> : getStatusIcon(question.status)}
            Classificação
          </Text>
          <Form
            className="grid grid-cols-1 gap-y-1 md:gap-y-2 mb-1"
            formFields={listFieldClassification}
            register={register}
            errors={errors}
          />
        </div>
        <div className="col-span-1 md:col-span-3">
          <Text
            className="flex w-full justify-center items-center"
            size="tertiary"
          >
            Informações da Questão
          </Text>
          <Form
            className="grid grid-cols-1 gap-y-1"
            formFields={listFieldInfoQuestion}
            register={register}
          />
          <div className="flex gap-1 mt-4">
            <Text size="secondary" className="text-orange w-60 text-start m-0">
              Resposta Correta*
            </Text>
            {Alternatives.map((alt) => (
              <Alternative
                key={alt.label}
                type="button"
                onClick={() => {
                  setValue("alternativa", alt.label);
                }}
                disabled={!question ? false : !isEditing}
                label={alt.label}
                select={alt.label === alternativa}
              />
            ))}
          </div>
        </div>
        <div className="col-span-1 md:col-span-2">
          <Text
            className="flex w-full justify-center gap-4 items-center flex-col"
            size="tertiary"
          >
            Imagem da Questão
          </Text>
          {question ? (
            <div className="p-1 m-1 flex-col">
              <div className="flex justify-center items-center border py-2">
                {imagePreview ? (
                  <ImagePreview imagePreview={imagePreview} />
                ) : (
                  imageSrc && (
                    <img
                      className="max-h-52 p-[1px] mr-4 sm:m-0 cursor-pointer"
                      src={imageSrc}
                      onClick={() => setPhotoOpen(true)}
                    />
                  )
                )}
              </div>
              {isEditing ? (
                <UploadButton
                  placeholder="Alterar imagem"
                  onChange={handleImageChange}
                  accept=".png"
                />
              ) : (
                <></>
              )}
            </div>
          ) : (
            <div>
              <div className="border py-4 flex justify-center items-center h-1/2">
                {imagePreview ? (
                  <ImagePreview imagePreview={imagePreview} />
                ) : (
                  <div className="h-60 flex justify-center items-center">
                    <Preview className="h-32 w-32" />
                  </div>
                )}
              </div>
              <UploadButton
                placeholder="Upload Imagem"
                onChange={handleImageChange}
                accept=".png"
              />
            </div>
          )}
          <BDownloadProva />
          <Text
            className="flex w-full justify-center gap-4 items-center"
            size="tertiary"
          >
            Revisões necessárias
          </Text>
          {checkboxData.map((check) => (
            <Checkbox key={check.name} {...check} setValue={setValue} />
          ))}
          <div className="grid grid-cols-2 gap-1 w-full">
            <Buttons />
          </div>
          {permissao.validarQuestao && question && question.status !== 1 && (
            <div
              className={`flex justify-end cursor-pointer my-4 md:my-4 ${
                !question && "hidden"
              }`}
              onClick={() => setTryDelete(true)}
            >
              <IoMdTrash className="w-10 h-10 fill-white bg-redError p-1 rounded shadow shadow-zinc-300" />
            </div>
          )}
        </div>
      </form>
      <QuestionImageModal />
      <ModalRefused />
      <ModalComeBack />
      <ModalDeleteQuestion />
    </div>
  );
}

export default ModalDetalhes;
